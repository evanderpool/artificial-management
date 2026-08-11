# Cloud Network Lab — Security Review

> **Redaction note (2026-08-11):** this repo is public. The Windows hostname and
> the real home-LAN addresses that appeared in the auditor's raw evidence have been
> replaced with `HOSTNAME-REDACTED` / `HOME-ROUTER-REDACTED` / `HOME-LAN-REDACTED`.
> No finding, severity, or conclusion was altered. Verified before commit: the file
> contains no private-key material, no password values, and no lease data.

**Date:** 2026-08-11
**Scope:** `gw` (10.0.1.4 / 10.0.2.1 / 192.168.56.10), `app` (10.0.2.20), the Windows host's VirtualBox configuration, and lab credential hygiene.
**Method:** Read-only. No configuration, package, service, or file on either guest or the host was modified. Active testing was confined to 10.0.1.0/24, 10.0.2.0/24, and 192.168.56.0/24.
**Auditor:** Automated security review, Artificial Management

---

## Summary

**The highest-consequence check passes: the lab cannot leak onto Erick's real home LAN.** Windows IP forwarding is `Disabled` on every host interface including the host-only adapter, there is no bridged adapter anywhere in either VM, and `app`'s VM has exactly one NIC attached to the isolated internal network with adapters 2–8 set to `none`. Segmentation holds where it matters most — `app` genuinely cannot reach the Windows host (ICMP silent, TCP 22/445/3389/8100 all filtered), and there is no inbound path from the simulated public network into the private subnet.

The one thing that is **wrong even for a lab** is that `PasswordAuthentication` is still `yes` on both hosts, even though the build script that provisioned them is commented "Key-based only." The user `erick` has a real password hash in `/etc/shadow` and holds `NOPASSWD:ALL` sudo, `fail2ban` is not installed, and nothing logs a dropped or failed packet anywhere in the system. That combination means a foothold on `app` converts to root on the router/bastion by guessing one password, with no detection.

Two design details deserve attention for the case study. First, the nftables `input` chain scopes rules by ingress *interface* only and never by destination address — so `app` can address gw's management IP (`192.168.56.10:22` responds `OPEN`) and its public IP. Second, "am-public simulates the internet" is not quite true: it is a live NAT path to the real world. `app` successfully resolved `deb.debian.org` through gw, whose upstream resolver is Erick's actual home router at HOME-ROUTER-REDACTED. Outbound egress and DNS exfiltration from the lab are fully functional today.

Everything else is either sound or is a defensible lab shortcut, and the sound parts are substantial — modern SSH crypto only, root locked with zero authorized keys, dnsmasq correctly bound and not an open resolver, a stock SUID set, no world-writable files, and no secret material anywhere in the git repository.

---

## Findings

| ID | Severity | Component | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|
| **F-01** | **High** | sshd — `gw` and `app` | Password authentication is enabled on both hosts despite the build script documenting key-only access. Combined with `erick` holding a real password hash, `NOPASSWD:ALL` sudo, and no brute-force daemon, a foothold anywhere on the private subnet is one password guess away from root on the router/bastion. This is documentation-vs-reality drift, not just a hardening gap. | `sshd -T` on **both** hosts: `passwordauthentication yes`, `usepam yes`, `maxauthtries 6`.<br>`/etc/shadow`: `erick: $6$H...` (live yescrypt hash).<br>`/etc/sudoers.d/90-lab`: `erick ALL=(ALL) NOPASSWD:ALL` (mode `440 root:root`).<br>`systemctl is-active fail2ban` → `inactive`; `dpkg -l fail2ban` → 0 installed.<br>`scripts/lab-setup-gw.sh:9`: `# Key-based only. The private key lives at C:\Users\Erick\CloudLab\build\lab_key` — yet the script never sets `PasswordAuthentication no`. | Add `PasswordAuthentication no` and `KbdInteractiveAuthentication no` to `/etc/ssh/sshd_config.d/10-lab.conf` on both hosts, and add that step to `lab-setup-gw.sh` / `lab-setup-node.sh` so a rebuild inherits it. This closes the finding at the source rather than on the running box. |
| **F-02** | Medium | nftables `input` chain — `gw` | Input rules match on ingress interface only, never on destination address. `app` can therefore open TCP sessions to gw's **management** address and its **public** address, not just its private-side address. Rated Medium rather than High because today all three addresses front the same sshd, so no *additional* service is exposed — but the interface-only pattern is latent: any future management-only service bound to 192.168.56.10 becomes private-subnet-reachable the moment it starts. | From `app` (10.0.2.20):<br>`OPEN   192.168.56.10:22`<br>`OPEN   10.0.1.4:22`<br>`OPEN   10.0.2.1:22`<br>`ping 192.168.56.10` → `REACHABLE`; `ping 10.0.1.4` → `REACHABLE`.<br>Governing rules: `iifname "enp0s8" tcp dport 22 accept` and `iifname "enp0s8" icmp type echo-request accept` — neither carries a `daddr` match. | Scope private-side input rules to the private-side address: `iifname "enp0s8" ip daddr 10.0.2.1 tcp dport 22 accept`, and likewise for 53, 67, and ICMP. Do the same for the management rules against `ip daddr 192.168.56.10`. |
| **F-03** | Medium | Host-only network / Windows host | The management path is bidirectional. `gw` can open TCP sessions to services on the Windows host — two ports answer. Windows Firewall permits them on the host-only profile. A compromised gw gets a foothold *back* toward the host, which is the opposite of what a bastion boundary should allow. | From `gw`:<br>`OPEN            192.168.56.1:7680`<br>`OPEN            192.168.56.1:8793`<br>(22, 135, 139, 445, 3389, 5357, 5040, 16992, 623, 8100, 8000 all `closed/filtered`; ICMP `no reply`)<br>Host listeners confirmed: `netstat -ano -p TCP` shows `0.0.0.0:7680` (PID 7676) and `0.0.0.0:8793` (PID 16784) bound to all interfaces. | Bind those two services to loopback or the real LAN adapter rather than `0.0.0.0`, or add an inbound Windows Firewall block rule for source 192.168.56.0/24. Verifying which processes own PIDs 7676 and 8793 is the first step. |
| **F-04** | Medium | dnsmasq — `gw` | Three DNS hygiene options are left commented out in the shipped config. `domain-needed` and `bogus-priv` are off, so short names and reverse lookups for private space are forwarded upstream — to Erick's **real home router**, leaking internal lab hostnames off the lab. `stop-dns-rebind` is absent entirely, so upstream answers pointing into 10.0.2.0/24 or 192.168.56.0/24 are returned unfiltered. DNSSEC trust anchors are passed on the command line but validation is not enabled, so they do nothing. | `/etc/dnsmasq.conf`: `#domain-needed`, `#bogus-priv`, `#dnssec`, `#dnssec-check-unsigned`, `#no-resolv` — all commented.<br>No `stop-dns-rebind` in `/etc/dnsmasq.conf` or `/etc/dnsmasq.d/`.<br>`ps -o args= -C dnsmasq` → `... --local-service --trust-anchor=.,20326,... --trust-anchor=.,38696,...` (anchors present, `dnssec` option absent → no validation).<br>`/etc/resolv.conf` → `nameserver HOME-ROUTER-REDACTED` (real home router). | Add `domain-needed`, `bogus-priv`, and `stop-dns-rebind` to `/etc/dnsmasq.d/lab.conf`. Either enable `dnssec` or drop the unused trust anchors. Consider pinning upstream with `no-resolv` + `server=` to a public resolver so lab DNS stops transiting the home router. |
| **F-05** | Medium | sshd bind address — `gw` and `app` | sshd binds `0.0.0.0:22` and `[::]:22` on both hosts, which on `gw` includes the public interface address 10.0.1.4. Only the nftables ruleset keeps SSH off the public side; there is no second control. If `nftables.service` fails to load — a flushed ruleset, a syntax error on edit, a boot-order fault — SSH with password auth (F-01) is immediately live on the simulated internet. | `ss -tulpn` on `gw`: `tcp LISTEN 0 128 0.0.0.0:22 ... sshd` and `tcp LISTEN 0 128 [::]:22 ... sshd`.<br>`sshd -T`: `listenaddress 0.0.0.0:22`, `listenaddress [::]:22`, `addressfamily any`.<br>Identical on `app`. | Set `ListenAddress 10.0.2.1` and `ListenAddress 192.168.56.10` on gw (and `ListenAddress 10.0.2.20` on app) so the public bind never exists. Defence in depth: the firewall should not be the only thing between sshd and the public segment. |
| **F-06** | Medium | `table ip nat` — `gw` | The masquerade rule matches on output interface alone with no source-address constraint: it will NAT anything that ever gets forwarded out `enp0s3`. Not exploitable today because the `forward` chain admits only `enp0s8 → enp0s3`, but the two rules are coupled by accident. Adding any future forward rule — say management-to-internet — silently inherits NAT with no review. | `nft list ruleset`:<br>`chain postrouting { type nat hook postrouting priority srcnat; policy accept; oifname "enp0s3" masquerade }`<br>No `ip saddr` match present. | Change to `ip saddr 10.0.2.0/24 oifname "enp0s3" masquerade` so the NAT scope is stated explicitly and cannot broaden by side effect. |
| **F-07** | Low | sysctl — `gw` and `app` | Reverse-path filtering is in loose mode, not strict. Routing in this topology is entirely symmetric, so strict mode is both correct and free — loose mode accepts spoofed sources that strict would drop. Separately, `gw` emits ICMP redirects and `app` accepts them, so a hostile host on am-private could redirect `app`'s traffic. | `gw`: `net/ipv4/conf/all/rp_filter 0`, `net/ipv4/conf/enp0s3/rp_filter 2`, `net/ipv4/conf/enp0s8/rp_filter 2` (effective = max = 2, loose); `net/ipv4/conf/all/send_redirects 1`.<br>`app`: `net/ipv4/conf/all/accept_redirects 1`, `net/ipv4/conf/all/send_redirects 1`, `net/ipv4/conf/all/rp_filter 0`.<br>`/etc/sysctl.d/99-lab-router.conf` contains only `net.ipv4.ip_forward=1`. | Extend `99-lab-router.conf` with `net.ipv4.conf.all.rp_filter=1`, `net.ipv4.conf.default.rp_filter=1`, `net.ipv4.conf.all.send_redirects=0`, `net.ipv4.conf.all.accept_redirects=0`, and `net.ipv4.conf.all.log_martians=1`. Ship the same accept/send-redirects lines to `app`. |
| **F-08** | Low | nftables IPv6 handling — `gw` | The filter table is `inet`, so IPv6 *is* covered and defaults to drop — that part is right. But there is no `icmpv6` accept rule at all, meaning Neighbour Discovery, MLD, and Path MTU Discovery are dropped wholesale, which RFC 4890 specifically warns against. Inert today because IPv6 never gets past link-local here, but the ruleset is not IPv6-correct and would fail confusingly the moment it did. | `nft list ruleset` input chain contains `icmp type echo-request accept` (IPv4 only); no `icmpv6` or `meta l4proto ipv6-icmp` rule anywhere.<br>`ip -6 addr show scope global` → empty on both hosts.<br>`net/ipv6/conf/all/forwarding 0`; `VBoxManage natnetwork list` → `IPv6: No`.<br>`net/ipv6/conf/all/accept_ra 1`, `disable_ipv6 0` — so an RA appearing on any segment *would* autoconfigure a global address. | Either add `icmpv6 type { nd-neighbor-solicit, nd-neighbor-advert, nd-router-advert, echo-request, packet-too-big, time-exceeded, parameter-problem, destination-unreachable } accept` to the input chain, or make the decision explicit by setting `net.ipv6.conf.all.disable_ipv6=1` and documenting the lab as IPv4-only. Half-handled IPv6 is the worst of the three options. |
| **F-09** | Low | Patch management — `gw` and `app` | Neither host has any automatic security patching. `unattended-upgrades` is not installed and neither `20auto-upgrades` nor `50unattended-upgrades` exists. The security suite *is* correctly configured in sources, so this is purely the automation that is missing. Both hosts are otherwise current. | `dpkg -l unattended-upgrades` → no `ii` line on either host.<br>`cat /etc/apt/apt.conf.d/20auto-upgrades` → file absent (`(end)` with no output).<br>`ls /etc/apt/apt.conf.d/` shows no `50unattended-upgrades`.<br>`apt-get -s upgrade` → `0 upgraded, 0 newly installed, 0 to remove and 1 not upgraded` (both hosts).<br>Sources do include `deb http://security.debian.org/debian-security trixie-security main non-free-firmware`. | `apt install unattended-upgrades` and enable the security origin on both hosts. Add it to the setup scripts so rebuilt guests inherit it. |
| **F-10** | Low | Observability — whole lab | Nothing in the lab records a security event. The ruleset contains zero `log` statements, so every dropped packet — including any public→private attempt the design is built to stop — vanishes silently. `log_martians` is off and there is no fail2ban. For a lab whose stated purpose is demonstrating segmentation, there is currently no way to *prove* a drop happened. | `nft list ruleset \| grep -c "log "` → `0`.<br>`net/ipv4/conf/all/log_martians` → `0`.<br>`systemctl is-active fail2ban` → `inactive`.<br>`/var/log/auth.log` shows only successful logins; grep for `Failed password` returned no count. | Add a `log prefix "nft-drop-fwd "` rule with `limit rate 5/minute` immediately before the policy drop in both `input` and `forward`. For the case study this is high value: it turns "the firewall blocks this" into demonstrable evidence. |
| **F-11** | Low | VirtualBox NAT Network `am-public` | The NAT network carries a loopback mapping making 10.0.1.2 an alias for the Windows host's `127.0.0.1`. Both guests can reach that address. Nothing is exposed *right now* — every host-loopback port tested was closed from the lab — but this is a standing pinhole from the lab into host-local services. Notably the EA Agent bridge on port 8100 currently binds the Tailscale address rather than loopback, which is what keeps it out of reach; a future rebind to `127.0.0.1` or `0.0.0.0` would expose it to the lab. | `VBoxManage natnetwork list` → `loopback mappings (ipv4)` / `127.0.0.1=2`.<br>From `gw` and from `app`: `ping 10.0.1.2` → `REACHABLE`.<br>From `gw`: 8791, 8792, 28385, 28390, 49351, 57359, 8100, 445, 135 all `closed/filtered`.<br>Host: `netstat` shows the bridge as `100.75.184.74:8100` (Tailscale-bound), not loopback. | Document the mapping as a known lab boundary and keep host services off `127.0.0.1`/`0.0.0.0` while the lab runs. Re-test 10.0.1.2 after any change to how `bridge/server.py` binds. |
| **F-12** | Low | Credential hygiene — Windows host | The lab SSH key has no passphrase and is the single factor for root on both guests, via `NOPASSWD:ALL`. A plaintext lab password sits in the same folder. The NTFS ACLs are genuinely good — the key carries an explicit, non-inherited ACL with no `Users` or `Authenticated Users` entry — so the exposure is limited to anything already running as Erick or as Administrator. Lab-acceptable; would be unacceptable in production, where this key would need a passphrase, an agent, and a rotation schedule. | `icacls lab_key` → `BUILTIN\Administrators:(F)`, `NT AUTHORITY\SYSTEM:(F)`, `HOSTNAME-REDACTED\Erick:(M)` — explicit, no `(I)` inheritance, no broad principals.<br>Key body contains no `ENCRYPTED` marker → **no passphrase**.<br>`credentials.txt` holds fields `lab user`, `lab password`, `ssh key`, and a `NEVER COMMIT THIS FILE` marker; its ACL is inherited `(I)` from the parent folder. | For the case study, note this as a deliberate, documented trade-off with the reasoning stated (unattended agent provisioning). If the lab is ever reachable by anything other than Erick's own session, add a passphrase and use an agent. |
| **F-13** | Info | AppArmor — `gw` | AppArmor is loaded and 106 profiles are present, but only 7 are enforcing, and neither `dnsmasq` nor `sshd` is among them. The two network-facing daemons on the router run unconfined. This is Debian's default posture, not a misconfiguration. | `aa-status` → `apparmor module is loaded. 106 profiles are loaded. 7 profiles are in enforce mode.` Enforcing set is `/usr/bin/man`, `lsb_release`, `man_filter`, `man_groff`, `nvidia_modprobe`, `nvidia_modprobe//kmod`, `tcpdump`. | Optional hardening with real case-study value: `aa-enforce usr.sbin.dnsmasq` demonstrates mandatory access control layered on top of network controls. |
| **F-14** | Info | nftables `input` chain — `gw` | There is no rule admitting DHCP client traffic on the public interface (`enp0s3`, udp/68). Lease renewal currently works because the unicast renewal is tracked by conntrack and matches `ct state established,related`. A broadcast DHCPNAK or a rebinding-state broadcast from a different server address would arrive as `NEW` and be dropped by policy, costing gw its public lease until reboot. Availability nit, not a security gap. | Ruleset has no `iifname "enp0s3"` rule of any kind.<br>`ss -tulpn` → `udp UNCONN 0 0 10.0.1.4:68 ... dhcpcd`.<br>`ip route` → `default via 10.0.1.1 dev enp0s3 proto dhcp src 10.0.1.4` — lease currently held. | If the lab is left running long-term, add `iifname "enp0s3" udp sport 67 udp dport 68 accept`. Alternatively give gw a static public address, which is arguably more realistic for a NAT gateway anyway. |
| **F-15** | Info | Lab egress model | Worth stating plainly for the case study: `am-public` does not simulate the internet — it *is* a route to it, and to Erick's home LAN. Verified working outbound egress and DNS resolution from the innermost host. This is inherent to VirtualBox NAT Network and is not a defect, but any claim of "fully isolated lab" needs this caveat. Inbound is genuinely closed (F-15 evidence below), so the risk is one-directional. | From `app` (private subnet, no external NIC): `getent hosts deb.debian.org` → `2a04:4e42:79::644 debian.map.fastlydns.net deb.debian.org`, `rc=0`.<br>`traceroute -n 10.0.1.1` from `app` → hop 1 `10.0.2.1`, hop 2 `10.0.1.1`.<br>gw `/etc/resolv.conf` → `nameserver HOME-ROUTER-REDACTED` (real home router) and `domain tail81aa28.ts.net` (host's Tailscale suffix, inherited via NAT DHCP).<br>`VBoxManage natnetwork list am-public` → no port-forwarding rules configured (no inbound path). | Add the caveat to `README.md`. If true isolation is ever wanted, detach the NAT Network and give gw a second internal network as a fake upstream — that change alone would make a strong follow-up case-study entry. |

**Totals:** 1 High · 5 Medium · 6 Low · 3 Info

---

## What Is Correctly Secured

This section exists because the controls below are the substance of the lab, and several of them were verified specifically because they are the ones most often gotten wrong.

### Segmentation and hypervisor isolation — the core design works

- **No route from the lab onto the real home LAN.** `Get-NetIPInterface` shows `Forwarding: Disabled` on **every** host interface — `Ethernet 2` (host-only), `Ethernet` (real LAN), `Tailscale`, and loopback. Windows will not route between the host-only segment and HOME-LAN-REDACTED/24. This was the highest-consequence check in the review and it passes cleanly.
- **No bridged adapter anywhere.** `VBoxManage showvminfo` on both VMs returns only `natnetwork`, `intnet`, and `hostonly` NIC types. No `bridgeadapter` key exists on either machine.
- **`app` is isolated at the hypervisor layer, not merely by firewall.** Its config is `nic1="intnet"` / `intnet1="am-private"` with `nic2` through `nic8` all `="none"`. There is no second path to disable — the isolation is structural.
- **`app` genuinely cannot reach the Windows host.** `ping 192.168.56.1` → no reply; TCP 22, 445, 3389, and 8100 to 192.168.56.1 all `closed/filtered`. The `forward` chain's absence of an `enp0s8 → enp0s9` rule is doing exactly its job.
- **No inbound path into the lab.** `VBoxManage natnetwork list am-public` shows no port-forwarding rules. The Windows routing table has routes for 192.168.56.0/24 only — no route to 10.0.1.0/24 or 10.0.2.0/24 exists on the host at all. Unsolicited public→private traffic has no ingress mechanism to be filtered in the first place, and the `forward` chain would drop it if it did.
- **Promiscuous mode is not enabled on any adapter** (no `nicpromisc` key present on either VM), so cross-VM sniffing on the internal network is not available by default.

### Firewall structure

- Both `input` and `forward` default to `policy drop`. Nothing is permitted implicitly.
- Conntrack is handled correctly and in the right order: `ct state established,related accept` followed by `ct state invalid drop` in both chains, with the required modules loaded (`nf_conntrack`, `nf_nat`, `nf_defrag_ipv4`, `nf_defrag_ipv6`).
- The `forward` chain contains exactly one accept — `iifname "enp0s8" oifname "enp0s3" accept` — a single egress-only rule with an explanatory comment. There is no public→private rule to review because none was written.
- The table is `inet`, so IPv4 and IPv6 are both subject to the drop policy rather than IPv6 being silently unfiltered. This is the single most common mistake in hand-written rulesets and it was avoided.
- **No unreachable or shadowed rules were found.** Every rule in every chain is reachable under some traffic pattern; the review looked specifically for dead rules and did not find any.
- The ruleset is loaded declaratively from `/etc/nftables.conf` by `nftables.service` (`ExecStart=/usr/sbin/nft -f /etc/nftables.conf`), so it is reproducible, reviewable, and version-controllable rather than accumulated interactively.

### dnsmasq — correctly scoped, not an open resolver

- Bound to the private interface only. `ss -tulpn` shows dnsmasq on `10.0.2.1:53`, `127.0.0.1:53`, `[::1]:53`, and `fe80::...%enp0s8:53` — and **not** on 10.0.1.4 or 192.168.56.10.
- Verified by query, not just by config: `dig @10.0.1.4 example.com` → `connection refused`; `dig @192.168.56.10 example.com` → `connection refused`; `dig @10.0.2.1 example.com` → answers normally. TCP/53 confirms the same shape — `closed/filtered` on the public and management addresses, `OPEN` on the private one.
- Config uses `interface=enp0s8` with `bind-interfaces`, plus explicit `except-interface=enp0s3` and `except-interface=enp0s9` — belt and braces.
- The daemon additionally runs with `--local-service`, which independently restricts it to queries from directly-attached subnets.
- **DHCP cannot be served where it should not be.** `no-dhcp-interface=enp0s9` is set, and `ss` shows the DHCP socket bound device-scoped as `0.0.0.0%enp0s8:67` — the `%enp0s8` is the important part. It cannot answer on the management or public segments.
- DHCP reservations are pinned by MAC (`dhcp-host=08:00:27:aa:00:20,app,10.0.2.20`) and the live lease matches, so addressing is deterministic.
- It runs as an unprivileged user (`-u dnsmasq`).

### Account and credential posture

- **Root is properly locked on both hosts.** `/etc/shadow` root password field is `!`, and `/root/.ssh/` exists but contains **zero** authorized keys on both machines. This makes the `PermitRootLogin without-password` default inert — there is no key to log in with and no password to fall back to.
- No accounts with empty passwords on either host (explicit scan of `/etc/shadow` returned nothing).
- Only one non-system account exists (`erick`, uid 1000) on each host. Nothing unexpected in `/etc/passwd`, and the `adm` group is empty.
- File permissions are correct throughout: `/home/erick` is `700`, `.ssh` is `700`, `authorized_keys` is `600` and owned by `erick:erick`, and `/etc/sudoers.d/90-lab` is `440 root:root`. SSH host private keys are all `600 root:root`.
- The `NOPASSWD` sudo rule is confined to a single dedicated drop-in file with a written justification in the provisioning script, rather than being edited into `/etc/sudoers` directly.

### Filesystem integrity

- **Zero world-writable files** under `/etc`, `/usr/local`, `/opt`, `/home`, or `/srv` on either host.
- **Zero world-writable directories missing the sticky bit** anywhere on either root filesystem.
- The SUID binary set is exactly stock Debian — `chfn`, `chsh`, `gpasswd`, `mount`, `newgrp`, `passwd`, `su`, `sudo`, `umount`, `dbus-daemon-launch-helper`, `ssh-keysign`. Nothing added, nothing unexpected.
- No stray private key material outside `/etc/ssh` (a filesystem-wide grep for private key headers across `/home`, `/root`, and `/etc` returned only the three legitimate SSH host keys).
- No user crontabs and no custom entries in `/etc/cron.d` — no hidden scheduled execution.

### SSH cryptography

- Modern algorithms only, with post-quantum key exchange as the default: `mlkem768x25519-sha256` and `sntrup761x25519-sha512` lead the KEX list.
- Ciphers are `chacha20-poly1305` and AES-GCM/CTR only — **no CBC modes, no arcfour, no 3DES**.
- MACs are encrypt-then-MAC variants first; no `hmac-md5`, no truncated-96 MACs.
- `PermitEmptyPasswords no`, `KbdInteractiveAuthentication no`, `IgnoreRhosts yes`, `HostbasedAuthentication no`, `GSSAPIAuthentication no`, `PermitUserEnvironment no`, `StrictModes yes`.
- OpenSSH's built-in per-source penalty system is active and unmodified (`persourcepenalties crash:90 authfail:5 noauth:1 ... max:600 min:15`), which supplies a meaningful amount of the rate-limiting that a missing fail2ban would otherwise provide.
- Login attempts are logged and attributable — `journalctl -u ssh` cleanly records `Accepted publickey for erick from 192.168.56.1 ... ED25519 SHA256:E/T9D/...`.

### Kernel network hardening already in place

`tcp_syncookies=1`, `accept_source_route=0`, `icmp_echo_ignore_broadcasts=1`, and `accept_redirects=0` on gw. IPv6 forwarding is off on both `all` and `default` (`net.ipv6.conf.all.forwarding=0`), so enabling IPv4 routing did not accidentally enable IPv6 routing — a common and easily-missed pairing.

### Patching baseline

Both hosts are effectively fully patched (`0 upgraded, 0 newly installed, 0 to remove and 1 not upgraded`), and the Debian security suite is correctly present in `/etc/apt/sources.list`. Only the *automation* is missing (F-09), not the configuration.

### Repository hygiene — clean

- `credentials.txt` lives at `C:\Users\Erick\CloudLab\build\`, **outside** the repository. `git check-ignore` confirms it: `'...credentials.txt' is outside repository at 'C:/Users/Erick/Desktop/EA Agent'`.
- `git ls-files` matching `cloudlab|lab_key|credentials` returns **nothing tracked**.
- A recursive grep for `BEGIN OPENSSH PRIVATE KEY` / `BEGIN RSA PRIVATE KEY` / `PRIVATE KEY-----` across the entire repo (excluding `.git`) returns **no matches**.
- No DHCP lease content, no password values, and no `/etc/shadow` material appear anywhere in the repo.
- The only key material committed is the **public** key, in `scripts/lab-setup-gw.sh:13` and `scripts/lab-setup-node.sh:15` — which is correct and necessary; public keys are not secrets.
- `build-lab.ps1` reads the password from the external `credentials.txt` at runtime rather than embedding it, and fails loudly if the file is absent — the right pattern.
- `git status` shows the review's own project directory as untracked and no secret-bearing file staged.

---

## Blast Radius Analysis

### If `app` (10.0.2.20) were fully compromised — root on the workload host

**Directly reachable, confirmed by test:**

1. **gw's SSH on all three of its addresses** — `10.0.2.1:22`, `10.0.1.4:22`, and `192.168.56.10:22` all returned `OPEN` from `app`. Password authentication is enabled, `fail2ban` is absent, and nothing logs failures. Success yields `erick`, and `NOPASSWD:ALL` yields root instantly. **This is the critical escalation edge.**
2. **gw's dnsmasq** — `10.0.2.1:53` `OPEN` on both TCP and UDP, plus DHCP on udp/67. This is a cache-poisoning and DHCP-interference surface against any other host that joins am-private (the config already reserves 10.0.2.30 for a future `db` host, which would receive `app`-poisoned answers).
3. **ICMP to every gw address** — useful for mapping; all three answer.
4. **The entire 10.0.1.0/24 NAT segment** — the `forward` chain permits `enp0s8 → enp0s3` for new connections, so `app` can originate to anything on the simulated public network. `ping 10.0.1.1` and `ping 10.0.1.2` both `REACHABLE` from `app`, and `traceroute` confirms the two-hop path through 10.0.2.1.
5. **10.0.1.2 — the Windows host's loopback alias.** Reachable at the IP layer today with no ports open. Becomes a real path into host-local services if anything ever binds `127.0.0.1` while the lab runs (F-11).
6. **The full public internet, outbound.** Confirmed working: `app` resolved `deb.debian.org` end to end. So a compromised `app` has working C2, tool download, and data exfiltration despite having no external network adapter.
7. **Erick's real home LAN, outbound.** gw's upstream resolver is HOME-ROUTER-REDACTED, so lab DNS traffic already transits the home router in normal operation. The NAT path provides general outbound reach to HOME-LAN-REDACTED/24. *(Not actively probed — out of authorised scope. The route's existence is established by `ip route` and the successful upstream resolution.)*

**Confirmed NOT reachable:**

- The Windows host at **192.168.56.1** — ICMP silent, TCP 22/445/3389/8100 all `closed/filtered`. The `forward` chain has no `enp0s8 → enp0s9` rule and the drop policy holds.
- Any other host-only-attached resource.
- Nothing can reach back *into* `app` except through gw. It has no listener but sshd, and no inbound ingress path exists from the public side.

**The escalation chain, stated plainly:**

`app` → SSH password brute-force against gw (unrate-limited, unlogged) → `erick` → `NOPASSWD` sudo → **root on the router, NAT gateway, DNS server, DHCP server, and bastion simultaneously**. From there the attacker can rewrite `/etc/nftables.conf` to bridge public↔private, disable the drop policies, sniff all inter-subnet traffic, poison DNS for the whole private subnet, and reach the two open Windows host ports 192.168.56.1:7680 and :8793 (F-03). gw is a single point of total lab compromise, which is architecturally correct for a bastion — but it means the controls protecting gw's own login are the ones that matter most, and those are exactly the controls F-01 identifies as weak.

### The shorter path that bypasses all of the above

Theft of `C:\Users\Erick\CloudLab\build\lab_key` from the Windows host is instant root on **both** guests, with no brute-forcing and no network position required. The key has no passphrase (F-12) and both hosts grant `NOPASSWD:ALL`. Its NTFS ACL is correctly restrictive, so this requires code already running as Erick or Administrator — but it is worth naming, because in this lab the Windows host, not the network, is the real trust anchor.

---

## Verification Commands

Set these once:

```powershell
$K  = "C:\Users\Erick\CloudLab\build\lab_key"
$KH = "C:\Users\Erick\CloudLab\build\known_hosts"
$VB = "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe"
```

Reach gw directly, or app via gw:

```bash
GW="ssh -i $K -o StrictHostKeyChecking=no -o UserKnownHostsFile=$KH erick@192.168.56.10"
APP="ssh -i $K -o StrictHostKeyChecking=no -o UserKnownHostsFile=$KH -o ProxyJump=erick@192.168.56.10 erick@10.0.2.20"
```

For anything with pipes, parentheses, or braces, write the command to a `.sh` file with UNIX line endings, `scp` it over, and run `bash /tmp/x.sh` — PowerShell mangles complex quoted remote commands. The `tcpt` helper used throughout this review was:

```bash
tcpt(){ timeout 4 bash -c "echo > /dev/tcp/$1/$2" 2>/dev/null && echo "OPEN $1:$2" || echo "closed/filtered $1:$2"; }
```

| Finding | Command | Where |
|---|---|---|
| F-01 | `sudo sshd -T \| grep -E 'passwordauthentication\|permitrootlogin\|maxauthtries'` | gw and app |
| F-01 | `sudo awk -F: '$1=="erick"{print substr($2,1,4)}' /etc/shadow` | gw and app |
| F-01 | `sudo cat /etc/sudoers.d/90-lab; systemctl is-active fail2ban` | gw and app |
| F-02 | `tcpt 192.168.56.10 22; tcpt 10.0.1.4 22; ping -c1 -W2 192.168.56.10` | **app** |
| F-02 | `sudo nft list ruleset` — inspect `input` chain for absent `ip daddr` matches | gw |
| F-03 | `for p in 7680 8793 445 135 3389; do tcpt 192.168.56.1 $p; done` | gw |
| F-03 | `netstat -ano -p TCP \| Select-String LISTENING` | Windows host |
| F-04 | `grep -rE 'domain-needed\|bogus-priv\|stop-dns-rebind\|dnssec' /etc/dnsmasq.conf /etc/dnsmasq.d/` | gw |
| F-04 | `ps -o args= -C dnsmasq; grep nameserver /etc/resolv.conf` | gw |
| F-05 | `sudo ss -tulpn \| grep :22` | gw and app |
| F-06 | `sudo nft list table ip nat` | gw |
| F-07 | `for p in all/rp_filter enp0s3/rp_filter all/send_redirects all/accept_redirects; do echo -n "$p "; cat /proc/sys/net/ipv4/conf/$p; done` | gw and app |
| F-08 | `sudo nft list ruleset \| grep -c icmpv6; ip -6 addr show scope global` | gw |
| F-09 | `dpkg -l unattended-upgrades; cat /etc/apt/apt.conf.d/20auto-upgrades` | gw and app |
| F-10 | `sudo nft list ruleset \| grep -c 'log '; cat /proc/sys/net/ipv4/conf/all/log_martians` | gw |
| F-11 | `& $VB natnetwork list` → look for `loopback mappings`; then `ping 10.0.1.2` | host, then gw |
| F-12 | `icacls C:\Users\Erick\CloudLab\build\lab_key`; `Select-String ENCRYPTED $K` | Windows host |
| F-13 | `sudo aa-status` | gw |
| F-14 | `sudo nft list ruleset \| grep enp0s3; sudo ss -tulpn \| grep :68` | gw |
| F-15 | `getent hosts deb.debian.org; traceroute -n -m 4 10.0.1.1` | **app** |
| Isolation (host leak) | `Get-NetIPInterface -AddressFamily IPv4 \| Select InterfaceAlias,Forwarding` | Windows host |
| Isolation (app NICs) | `& $VB showvminfo app --machinereadable \| Select-String '^(nic\|intnet\|bridge)'` | Windows host |
| Isolation (app→host) | `ping -c1 -W2 192.168.56.1; tcpt 192.168.56.1 445; tcpt 192.168.56.1 3389` | **app** |
| Resolver exposure | `dig +short +time=2 @10.0.1.4 example.com; dig +short +time=2 @192.168.56.10 example.com; dig +short +time=2 @10.0.2.1 example.com` | gw |
| Repo secrets | `git ls-files \| grep -i 'cloudlab\|lab_key\|credentials'` | `EA Agent` repo |
| Repo secrets | `grep -rIl 'BEGIN OPENSSH PRIVATE\|PRIVATE KEY-----' . --exclude-dir=.git` | `EA Agent` repo |
| Repo secrets | `git check-ignore -v C:/Users/Erick/CloudLab/build/credentials.txt` | `EA Agent` repo |

---

## Suggested Remediation Order

1. **F-01** — `PasswordAuthentication no` on both hosts, and in both setup scripts. One line, closes the only High.
2. **F-05** — pin `ListenAddress` so sshd never binds the public interface. Removes the single-control dependency behind F-01.
3. **F-10** — add rate-limited drop logging. Cheap, and it makes every other control demonstrable, which is what a portfolio case study needs.
4. **F-02** and **F-06** — add `ip daddr` / `ip saddr` scoping. Both are one-word edits to `/etc/nftables.conf` that meaningfully tighten the design.
5. **F-04** — three dnsmasq lines to stop leaking lab hostnames to the home router.
6. **F-07**, **F-09** — sysctl hardening and `unattended-upgrades`, ideally added to the provisioning scripts rather than the running hosts.
7. **F-08** — make the IPv6 decision explicit, either way.
8. **F-03** — identify the two host processes on 7680/8793 and take them off the host-only segment.
