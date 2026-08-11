#!/bin/bash
# Cloud Network Lab — first-boot setup for the private-subnet nodes (app, db).
# Runs chrooted inside /target at the end of the Debian install.
#
# Unlike gw, these nodes take their entire network identity from DHCP served by
# gw's dnsmasq, with a reserved lease keyed on MAC. Nothing about addressing is
# configured here — that is the point. In cloud terms these are instances in a
# private subnet receiving addressing from the VPC.
set -eux

# --- Agent SSH access -------------------------------------------------------
# Reachable only by ProxyJump through gw; these boxes have no path to the host.
mkdir -p /home/erick/.ssh
cat > /home/erick/.ssh/authorized_keys <<'KEY'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIMSj9UFqFgw0wEL9MsGvt+K83qHklSfB/hZNdnwUGSM cloud-network-lab-agent
KEY
chmod 700 /home/erick/.ssh
chmod 600 /home/erick/.ssh/authorized_keys
chown -R erick:erick /home/erick/.ssh

# --- Passwordless sudo — LAB ONLY -------------------------------------------
echo 'erick ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/90-lab
chmod 440 /etc/sudoers.d/90-lab

systemctl enable ssh || true
