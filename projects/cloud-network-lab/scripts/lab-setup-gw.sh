#!/bin/bash
# Cloud Network Lab — gw first-boot setup
# Runs chrooted inside /target at the end of the Debian install.
# Delivered base64-encoded inside the preseed late_command so that no quoting
# has to survive the PowerShell -> VBoxManage -> preseed -> shell chain.
set -eux

# --- Agent SSH access -------------------------------------------------------
# Key-based only. The private key lives at C:\Users\Erick\CloudLab\build\lab_key
# on the host and is never committed.
mkdir -p /home/erick/.ssh
cat > /home/erick/.ssh/authorized_keys <<'KEY'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIMSj9UFqFgw0wEL9MsGvt+K83qHklSfB/hZNdnwUGSM cloud-network-lab-agent
KEY
chmod 700 /home/erick/.ssh
chmod 600 /home/erick/.ssh/authorized_keys
chown -R erick:erick /home/erick/.ssh

# --- Passwordless sudo — LAB ONLY -------------------------------------------
# Justified because the agent configures this box unattended over SSH.
# This is NOT a pattern to carry into Phase 2/3 cloud instances.
echo 'erick ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/90-lab
chmod 440 /etc/sudoers.d/90-lab

# --- Static addressing on the two non-installer NICs ------------------------
# enp0s3 (NIC1, NAT Network am-public) is configured by the installer via DHCP.
# enp0s8 (NIC2) is this box's face on the private subnet — it IS the default
#   gateway that app and db will point at.
# enp0s9 (NIC3) is the management path from the Windows host, i.e. the bastion
#   entrance. Equivalent to reaching a bastion over its admin path in cloud.
cat > /etc/network/interfaces.d/lab <<'IFACES'
# private subnet gateway  (cloud equivalent: NAT gateway ENI in the public subnet)
auto enp0s8
iface enp0s8 inet static
    address 10.0.2.1
    netmask 255.255.255.0

# management / bastion access from the Windows host
auto enp0s9
iface enp0s9 inet static
    address 192.168.56.10
    netmask 255.255.255.0
IFACES

systemctl enable ssh || true
