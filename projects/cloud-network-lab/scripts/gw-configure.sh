#!/bin/bash
# Cloud Network Lab — turn gw into a router, NAT gateway, DHCP/DNS server,
# and firewall for the private subnet.
#
# Run as root on gw. Idempotent — safe to re-run.
#
# Interface roles (verify with `ip -br link` before running):
#   enp0s10 NIC4  Internal Network am-edge 10.0.0.10  -> uplink, BEHIND am-fw01
#   enp0s8  NIC2  Internal Network am-private 10.0.2.1 -> private subnet gateway
#   enp0s9  NIC3  Host-only 192.168.56.10              -> management / bastion
#   (enp0s3 NIC1 was the original direct uplink to am-public; removed once the
#    OPNsense perimeter took over on 2026-08-11)
set -euo pipefail

# WAN moved from enp0s3 (direct to am-public) to enp0s10 (am-edge, behind the
# OPNsense perimeter) on 2026-08-11. Interface names are variables and are
# substituted into the ruleset below -- the first version hardcoded them in the
# heredoc, which meant a topology change required editing the firewall rules by
# hand in three places. Exactly the kind of thing that gets edited in two.
WAN=${WAN:-enp0s10}
LAN=${LAN:-enp0s8}
MGMT=${MGMT:-enp0s9}

for i in "$WAN" "$LAN" "$MGMT"; do
    ip link show "$i" >/dev/null 2>&1 || { echo "FATAL: interface $i missing"; exit 1; }
done

# ---------------------------------------------------------------------------
# 1. IP forwarding — the single setting that turns a host into a router.
#    Without this the kernel receives packets for other destinations and
#    silently discards them. Cloud equivalent: nothing, because a managed NAT
#    Gateway hides this entirely — which is exactly why it is worth doing once
#    by hand.
# ---------------------------------------------------------------------------
cat > /etc/sysctl.d/99-lab-router.conf <<'EOF'
net.ipv4.ip_forward=1
EOF
sysctl -q -p /etc/sysctl.d/99-lab-router.conf

# ---------------------------------------------------------------------------
# 2. dnsmasq — DHCP + DNS for the private subnet.
#    Cloud equivalent: the VPC's built-in DHCP option set and the .2 resolver.
#    Static leases keyed on MAC so app/db get stable addresses.
# ---------------------------------------------------------------------------
cat > /etc/dnsmasq.d/lab.conf <<EOF
# Serve only the private subnet. Never answer on the public or mgmt side.
interface=${LAN}
bind-interfaces
except-interface=${WAN}
except-interface=${MGMT}
no-dhcp-interface=${MGMT}

domain=corp.internal
local=/corp.internal/
expand-hosts

dhcp-range=10.0.2.100,10.0.2.200,12h
dhcp-option=option:router,10.0.2.1
dhcp-option=option:dns-server,10.0.2.1

# Reserved addresses — MACs are set explicitly at VM creation time.
dhcp-host=08:00:27:aa:00:20,am-app01,10.0.2.20
dhcp-host=08:00:27:aa:00:30,am-db01,10.0.2.30
dhcp-host=08:00:27:aa:00:40,am-dc01,10.0.2.40
EOF

sed -i '/^10\.0\.2\.2[0-9]/d; /^10\.0\.2\.3[0-9]/d; /^10\.0\.2\.4[0-9]/d' /etc/hosts
cat >> /etc/hosts <<'EOF'
10.0.2.20   am-app01 am-app01.corp.internal
10.0.2.30   am-db01  am-db01.corp.internal
10.0.2.40   am-dc01  am-dc01.corp.internal
EOF

systemctl enable dnsmasq
systemctl restart dnsmasq

# ---------------------------------------------------------------------------
# 3. nftables — NAT plus a default-deny firewall.
#
#    The forward chain is the interesting one. Its policy is drop, and exactly
#    one rule permits new traffic: private -> public. There is deliberately NO
#    rule permitting public -> private. That single asymmetry is what makes
#    10.0.2.0/24 a *private* subnet rather than merely a second routed network,
#    and it is precisely what an AWS private subnet + NAT Gateway buys you.
# ---------------------------------------------------------------------------
cat > /etc/nftables.conf <<EOF
#!/usr/sbin/nft -f
flush ruleset

table inet filter {
    chain input {
        type filter hook input priority filter; policy drop;

        ct state established,related accept
        ct state invalid drop
        iif lo accept

        # Management path from the Windows host — the bastion entrance.
        iifname "${MGMT}" tcp dport 22 accept
        iifname "${MGMT}" icmp type echo-request accept

        # --- Management-plane separation -----------------------------------
        # MUST come before the enp0s8 service rules below.
        #
        # A router is a member of every segment it touches, so packets from the
        # private subnet addressed to this box's MANAGEMENT address are
        # delivered locally and hit INPUT -- they are never routed, so the
        # forward chain's drop never sees them. Matching only on `iifname`
        # therefore accepts SSH aimed at the management IP as readily as SSH
        # aimed at the gateway IP.
        #
        # Found by test, not by review: `app` reached 192.168.56.10:22.
        iifname "${LAN}" ip daddr 192.168.56.0/24 counter drop

        # Private subnet may use this box as bastion hop, resolver, and DHCP —
        # but only at its PRIVATE address, never at any other local address.
        iifname "${LAN}" ip daddr 10.0.2.1 tcp dport 22 counter accept
        iifname "${LAN}" ip daddr 10.0.2.1 udp dport 53 counter accept
        iifname "${LAN}" ip daddr 10.0.2.1 tcp dport 53 counter accept
        iifname "${LAN}" ip daddr 10.0.2.1 icmp type echo-request counter accept

        # DHCP is the exception that must stay address-agnostic: a client with
        # no lease yet sends to 255.255.255.255, so a daddr match on 10.0.2.1
        # would break the very bootstrap it exists to serve.
        iifname "${LAN}" udp dport 67 counter accept

        # Nothing from the public side reaches this host's services.
    }

    chain forward {
        type filter hook forward priority filter; policy drop;

        counter ct state established,related accept
        counter ct state invalid drop

        # Egress only: private subnet may initiate outbound to the internet.
        counter iifname "${LAN}" oifname "${WAN}" accept

        # Explicit counter on the direction that must never work. This rule
        # changes nothing -- policy drop already handles it -- but it makes the
        # drop VISIBLE. "nft list chain inet filter forward" then answers
        # "is anything trying to reach the private subnet from outside?"
        # with a number instead of a shrug.
        counter iifname "${WAN}" oifname "${LAN}" drop
    }

    chain output {
        type filter hook output priority filter; policy accept;

        # Replies to anything already in flight — including the operator's own
        # SSH session arriving on the management interface.
        ct state established,related accept

        # The management path is INBOUND ONLY. gw answers the workstation; it
        # never initiates toward it. Without this, a compromised bastion can
        # pivot from the lab back into the Windows host, which the audit found
        # listening on 192.168.56.1:7680 and :8793.
        #
        # A bastion is a door, and a door should only open one way.
        oifname "${MGMT}" ct state new counter drop
    }
}

table ip nat {
    chain prerouting {
        type nat hook prerouting priority dstnat; policy accept;
    }
    chain postrouting {
        type nat hook postrouting priority srcnat; policy accept;
        # Source NAT everything leaving the public interface.
        # Cloud equivalent: the NAT Gateway's elastic IP.
        counter oifname "${WAN}" masquerade
    }
}
EOF

chmod 755 /etc/nftables.conf
nft -f /etc/nftables.conf
systemctl enable nftables

echo "=== ip_forward ==="
sysctl net.ipv4.ip_forward
echo "=== interfaces ==="
ip -br addr
echo "=== nft ruleset (forward chain) ==="
nft list chain inet filter forward
echo "=== nat postrouting ==="
nft list chain ip nat postrouting
echo "=== dnsmasq ==="
systemctl is-active dnsmasq
echo "OK"
