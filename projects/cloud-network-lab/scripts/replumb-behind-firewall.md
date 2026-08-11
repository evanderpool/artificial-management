# Runbook — moving `am-rtr01` behind the OPNsense firewall

**Risk level: high.** This changes the uplink of a working router that four
other machines depend on for DHCP, DNS, and internet access. Written before
execution, on purpose — a change that can strand the whole lab deserves a plan
that exists outside the head of whoever is typing.

---

## Before

```
internet ── am-public (NAT Network, 10.0.1.0/24)
                │
          am-rtr01 enp0s3 (DHCP 10.0.1.4)
                │
          am-private 10.0.2.0/24 ── am-app01, am-dc01, am-db01
```

## After

```
internet ── am-public (NAT Network, 10.0.1.0/24)
                │
          am-fw01 WAN  (DHCP 10.0.1.x)          <-- OPNsense, perimeter
          am-fw01 LAN  10.0.0.1/24
                │
          am-edge (Internal Network, 10.0.0.0/24)
                │
          am-rtr01 enp0s3 10.0.0.10 (static)
                │
          am-private 10.0.2.0/24 ── am-app01, am-dc01, am-db01
```

Two firewalls in series, which is the point: a perimeter appliance doing
north-south filtering and IDS, and a host firewall doing east-west
segmentation. Defence in depth is not a slogan here — the audit already proved
the host firewall catches things the perimeter never sees, because traffic
between `am-app01` and `am-rtr01` never crosses the perimeter at all.

---

## What can go wrong, and what saves us

| Failure | Consequence | Mitigation |
|---|---|---|
| `am-rtr01` loses its uplink | Whole lab loses internet; DHCP/DNS still work | Management path is `enp0s9` (host-only) and is **untouched** by this change — SSH access survives regardless |
| OPNsense LAN not configured before cutover | `am-rtr01` has a cable to nowhere | Configure and verify `am-fw01` LAN **first**, cut over second |
| Static IP typo on `am-rtr01` | Router unreachable on the edge segment | Management path unaffected; fix over SSH |
| NAT double-translation confusion | Traffic works but source addresses look wrong | Expected and intentional — see note below |

**The management path is the safety net.** `enp0s9` (192.168.56.10) is on the
host-only network and has nothing to do with the uplink. Even a total failure
of this change leaves `am-rtr01` reachable. That is exactly why the design put
management on a separate segment, and it is worth stating that the payoff
arrives now, not at audit time.

---

## Order of operations

1. **Configure `am-fw01` first, verify, and only then touch the router.**
   - Pin interface roles explicitly (autodetect got them backwards — see build log)
   - WAN = the NIC on `am-public`, DHCP
   - LAN = a new NIC on `am-edge`, static `10.0.0.1/24`
   - Management = host-only NIC, static `192.168.56.20/24`, web GUI bound here
   - Confirm GUI reachable at `https://192.168.56.20` from Windows
   - Confirm `am-fw01` itself reaches the internet

2. **Add a second uplink NIC to `am-rtr01` rather than moving the first.**
   Attach a new NIC on `am-edge` while leaving `enp0s3` on `am-public`. The
   router briefly has two paths out. Verify the new one works *before* removing
   the old one. Never remove the working path to test the replacement.

3. **Switch the default route** to the `am-edge` gateway (`10.0.0.1`), verify
   egress from `am-app01`, then remove the old NIC.

4. **Re-run the isolation tests.** New topology, same claims — they have to be
   re-proved, not assumed to survive.

---

## Note: double NAT is expected here

`am-rtr01` masquerades `10.0.2.0/24` behind `10.0.0.10`; `am-fw01` masquerades
`10.0.0.0/24` behind its WAN address; VirtualBox's NAT Network masquerades that
behind the host. Three translations.

This is not a mistake, and it is worth understanding rather than tidying away:
it is exactly what happens in real networks with a corporate edge firewall in
front of a departmental router, and it is why troubleshooting connectivity from
a packet capture at the edge shows you the *firewall's* address rather than the
originating host. The lesson lands harder here than reading about it.

`am-fw01`'s LAN rules will log the pre-translation source, which is how a real
investigation recovers the original host.

---

## Rollback

Single command, because the old path is not deleted until the new one is proven:

```
VBoxManage modifyvm '02-CORE-Router-Bastion (Debian)' --nic1 natnetwork --nat-network1 am-public
```

Then restore the default route via `10.0.1.1`. Management access is never part
of the blast radius.
