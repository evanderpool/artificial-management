# Cloud Network Lab — Build Log

Append-only. Dated entries, newest at the bottom. **Failures stay in.**

The wrong turns are the point of this document. A build log that records only
the working end state produces the everything-worked-first-try narrative that
makes portfolio projects read as fiction. If something took forty minutes to
diagnose, the forty minutes get written down.

Executed by the Claude Code agent under Erick's direction unless an entry says
otherwise.

---

## 2026-08-11 — Session 1: decision, registration, ISO

### Host survey

Ran before recommending anything, because the premise under discussion
("we have Hyper-V on this PC") needed checking.

| | |
|---|---|
| Edition | Windows 11 **Home**, build 26200 |
| CPU | Intel i7-6700 — 4 cores / 8 threads (Skylake) |
| RAM | 31.8 GB |
| Free disk | 788 GB |
| `HypervisorPresent` | True |
| `virtmgmt.msc` / `vmms.exe` | **Absent** |
| `vmms` service | **Not registered** |
| WSL2 | Installed, zero distros |
| VirtualBox / Docker / terraform / aws / az | None installed |

**Finding: this machine does not have Hyper-V, and cannot.** Hyper-V Manager
and the Hyper-V role are Pro/Enterprise/Education features; Microsoft does not
ship them on Home. The Hyper-V Manager console and the VMMS service are not on
disk at all.

`HypervisorPresent: True` is what made it *look* like Hyper-V was available.
That flag reports the **Virtual Machine Platform** — the reduced hypervisor
Windows runs beneath itself for WSL2 and virtualization-based security. It
hosts WSL; it does not host general-purpose VMs. You cannot build a lab on it.

So the VirtualBox-vs-Hyper-V question was decided by the Windows license before
it was ever asked.

### The consequence nobody mentions

Because the Microsoft hypervisor already owns the CPU's VT-x extensions,
VirtualBox cannot take them directly. VirtualBox 7.x handles this by routing
through the Windows Hypervisor Platform API — functional, but measurably slower
than native execution.

Three options were weighed:

| Option | Verdict |
|---|---|
| Accept the slowdown | **Chosen.** The VMs are headless Linux servers running sshd and a firewall. The performance penalty lands on workloads this lab does not have. |
| Disable VBS + Virtual Machine Platform to reclaim native VT-x | Rejected — costs WSL2 and lowers the host's security posture to buy speed that will not be felt. |
| VMware Workstation Pro (free for personal use since late 2024) | Viable, better coexistence, nicer virtual-network editor. Held in reserve if VirtualBox performance actually becomes a problem rather than a theoretical one. |

### Project shape

Settled with Erick in conversation:

- Erick is applying for **both** cloud and AI engineering roles, so the lab has
  to serve both. Resolved by making the `db` tier Postgres + pgvector, so the
  lab becomes the rehearsal environment for the canonical-store migration
  instead of competing with it for hours.
- The artifact is a **portfolio piece**, not private learning.
- Erick's stated plan — local first, then cloud, with the evolution itself as
  the case-study narrative — was adopted, with one addition: a middle phase.
  Local → **cloud by hand (console)** → cloud as code (Terraform). Going
  straight from VMs to Terraform produces someone who can run `apply` without
  knowing what it built.
- Erick asked that the build be executed by the AI agent end to end. Agreed,
  with one carve-out: the deliberate break/fix drills stay his, because that is
  the part that has to live in a human's hands to survive an interview.
- Documentation registered **before** the first VM, not after. If the evolution
  is the product, the log has to start at commit one — a reconstructed log is a
  sanitised one.
- Debian chosen over Alpine. Erick self-assessed as "confident but still
  practicing." Alpine means BusyBox, `apk`, and OpenRC — a second dialect to
  learn that is *not* what runs on a cloud instance. Debian gives systemd and
  `apt`, which transfer directly. Costs ~250 MB of RAM; buys relevance.

### Work completed

- Lab root created at `C:\Users\Erick\CloudLab` (`iso/`, `vms/`, `build/`) —
  deliberately outside the git repo so VM disks never enter version control.
- Debian **13.6.0** amd64 netinst downloaded (755 MB).
- **Checksum verified against the published SHA256SUMS — match.**
  `65273beed27b2df543b68b65630ba525cfbad8df2b12035732b2dff87d6664e7`
  Verifying the image is not ceremony: an unverified OS image is an unverified
  trust root for every machine built from it.

### Open / next

- VirtualBox is not yet installed. It ships kernel drivers, so installation
  requires an administrator elevation prompt — a human at the keyboard has to
  approve it. Same constraint applies to creating the host-only adapter
  (`VBoxManage hostonlyif create` needs elevation on Windows). This is the one
  part of the build the agent cannot do unattended.
- Next: install VirtualBox, create the `am-public` NAT Network and the host-only
  adapter, author the preseed, build `gw`.

---

## 2026-08-11 — Session 1 continued: VirtualBox in, first VM, first failure

### VirtualBox installed

`winget install Oracle.VirtualBox 7.2.14` — exit 0, elevated cleanly with no
UAC dialog left waiting. `VBoxManage.exe --version` → `7.2.14r174565`.

Unexpected bonus: **the host-only adapter already existed** after install —
`VirtualBox Host-Only Ethernet Adapter` at `192.168.56.1/24`, DHCP disabled.
The install created it, so the second elevation step anticipated in the
previous entry never had to happen. Static addressing on that segment is
preferable anyway.

### Networks

```
VBoxManage natnetwork add --netname am-public --network 10.0.1.0/24 --enable --dhcp on
```
→ `am-public`, gateway `10.0.1.1`, DHCP on.

Verification note worth keeping: `VBoxManage showvminfo gw --machinereadable`
reports `nic1="natnetwork"` but does **not** emit a key naming *which* NAT
network is attached. Confirming the attachment meant reading the VM's XML
directly — `<NATNetwork name="am-public"/>` in `gw.vbox`. A grep of
machine-readable output would have shown a plausible-looking but incomplete
result. Check the artifact, not the summary.

### Automation approach

`VBoxManage unattended install` handles Debian preseed generation and ISO
injection natively, but its `--post-install-command` hook runs *outside* the
install target and every quote has to survive PowerShell → VBoxManage →
preseed → shell. Rather than fight that chain, the setup script is written as
a normal bash file, **base64-encoded on the host, and decoded inside
`late_command`**:

```
d-i preseed/late_command string echo '<base64>' | base64 -d > /target/root/lab-setup.sh \
 && chroot /target /bin/bash /root/lab-setup.sh
```

No quoting survives the boundary because no quoting crosses it. Script source
is version-controlled at `scripts/lab-setup-gw.sh`; the encoding happens at
build time.

The install runs with **NIC1 only attached**. NIC2 (private) and NIC3
(host-only) are added after installation. Reason: `netcfg/choose_interface
select auto` is ambiguous when three NICs have link but only one has DHCP, and
guessing `enp0s3` correctly is a coin flip worth not tossing. The static
config for the other two is written by `lab-setup-gw.sh` during install and
sits inert until those NICs appear.

### FAILURE — installer stalled on low memory

First install attempt hung. A screenshot showed why:

```
[!!] Low memory
Entering low memory mode
This system has relatively little free memory, so it will enter low
memory mode. ... <Continue>
```

**Cause:** `gw` was created with 768 MB, the figure planned for its *runtime*
footprint. Debian 13's installer wants roughly 1 GB. Below that it enters low
memory mode and raises a `[!!]` critical-priority dialog — and `priority=critical`
does not suppress `[!!]`, it is the level that *guarantees* it is shown. No
preseed answer covers it, so an "unattended" install sat waiting for a
keypress that was never coming.

**Fix:** raise `gw` to 2048 MB for the install, then drop it back to 768 MB
once installed. Only the installer needs the memory; a headless Debian running
sshd, dnsmasq, and nftables idles near 150 MB.

**Lesson, and it generalises past this lab:** RAM sized for steady state is not
RAM sized for provisioning. The same trap exists in cloud — an instance type
chosen for what the service needs at rest can fail during image build,
migration, or upgrade. Size for the peak of the *lifecycle*, not the average of
the workload.

**Diagnostic worth naming:** a headless VM that "hangs" gives no error output
at all. `VBoxManage controlvm <vm> screenshotpng` produced the answer in one
command. When something headless stalls, look at its screen before theorising.

---

## 2026-08-11 — Session 1 continued: gw is a router

### Install completed at 2048 MB

Nine minutes, fully unattended, ending at a `Debian GNU/Linux 13 gw tty1`
login prompt. Then powered off, dropped to 768 MB, and NIC2/NIC3 attached
while off (both changes require a stopped VM).

### The interface-naming bet paid off

The static config written during install guessed `enp0s8` and `enp0s9` for the
NICs that did not yet exist. On first boot with all three attached:

```
enp0s3   UP   10.0.1.4/24        <- DHCP from NAT Network am-public
enp0s8   UP   10.0.2.1/24        <- private subnet gateway (static, from install)
enp0s9   UP   192.168.56.10/24   <- management path (static, from install)
default via 10.0.1.1 dev enp0s3
```

VirtualBox maps NIC1/2/3 to PCI slots 3/8/9, so predictable naming yields
`enp0s3`/`enp0s8`/`enp0s9`. Worth knowing, but the safer habit is what the
build actually did: install with one NIC, verify names, then attach the rest.

### Firewall dead-man switch

Applying a `policy drop` input chain over the only SSH path is how people lock
themselves out of remote machines. Before applying:

```
sudo systemd-run --on-active=180 --unit=fw-rollback /usr/sbin/nft flush ruleset
```

A timer set to wipe the ruleset in three minutes. Apply the config, confirm a
*fresh* SSH connection still succeeds, then cancel the timer. If the rules had
been wrong, the box would have healed itself and the worst case is a three
minute wait instead of a console rescue.

This is the local rehearsal for the same discipline in cloud: never apply a
security-group change you cannot roll back without the access you are about to
break.

### What gw now does

| Function | Mechanism | Cloud equivalent |
|---|---|---|
| Routing | `net.ipv4.ip_forward=1` | invisible inside a managed NAT Gateway |
| Source NAT | `oifname enp0s3 masquerade` | NAT Gateway + its elastic IP |
| Egress-only policy | forward chain `policy drop` + one rule `enp0s8 -> enp0s3` | private subnet route table |
| DHCP + DNS | dnsmasq on `enp0s8`, reserved leases by MAC | VPC DHCP option set + `.2` resolver |
| Bastion | sshd reachable only on `enp0s9` and `enp0s8` | bastion host / SSM |

**The asymmetry is the whole lesson.** The forward chain permits
`enp0s8 -> enp0s3` and nothing permits `enp0s3 -> enp0s8`. That one missing
rule is the entire difference between a private subnet and a second routed
network — and it is exactly what an AWS private subnet plus NAT Gateway sells
you as a managed product.

### app installed THROUGH the gateway

`app` was created on `am-private` with a fixed MAC and **no other network
attachment** — no NAT, no host-only, no route to the host. Its Debian
installer therefore had exactly one way to reach a package mirror: DHCP from
`gw`, DNS from `gw`, and NAT through `gw`.

First confirmation, from `gw`'s lease file:

```
1786498338 08:00:27:aa:00:20 10.0.2.20 app 01:08:00:27:aa:00:20
```

Reserved lease honoured — `app` is `10.0.2.20` because its MAC was declared in
`dnsmasq.d/lab.conf` before it ever booted. The install proceeding at all is
the gateway's functional test; no separate "does NAT work" check is needed,
because a netinst that cannot route cannot install.

### Improvement made mid-flight: counters

`conntrack` is not installed and byte counters on an interface do not tell you
*which rule* traffic matched. The ruleset now carries `counter` on every
meaningful rule, plus one rule that changes no behaviour at all:

```
counter iifname "enp0s3" oifname "enp0s8" drop
```

`policy drop` already blocks that direction. The explicit rule exists so the
drop is *visible* — `nft list chain inet filter forward` answers "is anything
trying to reach the private subnet from outside?" with a number instead of
silence. Counters are applied after `app` finishes installing, since reloading
the ruleset mid-install would disturb the very traffic being proven.

### CORRECTION — the NAT proof, measured properly

The previous entry claimed "the install proceeding at all is the gateway's
functional test; a netinst that cannot route cannot install." **That was
wrong**, and the counters caught it. Left in place rather than edited — the
log is append-only and a walked-back claim is worth more than a quietly
deleted one.

Why it was wrong: a Debian **netinst ISO carries the base system locally**.
"Installing the base system" reads from the virtual CD. At 53% installed,
`gw`'s private interface had moved 1 KB total — the DHCP exchange and nothing
else. The phase being pointed at as proof proved only that DHCP worked.

The real test is the package-selection stage, where `openssh-server`,
`nftables`, `tcpdump`, `curl` and their dependencies must come from
`deb.debian.org`. Sampling `/sys/class/net/*/statistics/` on `gw` every 30s:

| Sample | `enp0s8` TX (toward app) | `enp0s3` RX (from internet) |
|---|---|---|
| 30s | 2,238 | 12,800 |
| 60s | 42,264,410 | 42,335,428 |
| 90s | 47,436,978 | 47,443,694 |
| 120s | 49,260,027 | 49,266,640 |
| 330s | 49,264,235 | 49,270,331 |

**~49.26 MB forwarded, and the two interface counters agree to within 0.01%.**
Bytes arriving on the public interface leave on the private interface almost
exactly — which is what forwarding *is*. `app` has no other network
attachment, so there is no alternative path those bytes could have taken.

That is the NAT proof: not "the install finished," but two counters that match.

**Lesson for Phase 2:** the thing that looks like proof usually isn't. A cloud
instance that boots does not prove its route table is correct; a health check
that returns 200 does not prove traffic took the path you designed. Measure the
path, not the outcome.

---

## 2026-08-11 — app verified, and a real isolation break found

### SSH bastion: ProxyJump failed for a non-obvious reason

`ssh -o ProxyJump=erick@192.168.56.10 erick@10.0.2.20` failed with
`Connection timed out during banner exchange`, while `gw` could open
`10.0.2.20:22` directly (proved with `/dev/tcp`). So the network path was fine
and the jump mechanism was not.

Cause: **`-o ProxyJump=` does not pass `-i <key>` to the inner connection** on
Windows OpenSSH. The inner hop authenticated with default keys, found none, and
stalled. Explicit `-o ProxyCommand="ssh -i <key> ... -W %h:%p erick@gw"` worked
immediately.

Fixed properly with an SSH client config (`scripts/ssh_config`) declaring
`lab-gw`, `lab-app`, `lab-db`, each with its own `IdentityFile`. Usage is now
`ssh -F <config> lab-app`. This is the correct bastion pattern regardless of
the bug: **the private key stays on the workstation and is never copied to the
jump host**, which is the entire security argument for having a bastion.

### Isolation test results

Run from `app` (10.0.2.20), which has exactly one NIC on `am-private`:

| Test | Expectation | Result |
|---|---|---|
| A — internet via gw NAT | works | `http=200` |
| B — reach `gw` private side 10.0.2.1 | works | reachable |
| C — reach Windows host 192.168.56.1 | **blocked** | blocked |
| D — reach management IP 192.168.56.10:22 | **blocked** | **REACHED — FAIL** |

### FINDING: interface-matched rules are not address-matched rules

Test D failed, and the reason is worth more than the fix.

The input chain contains:

```
iifname "enp0s8" tcp dport 22 accept
```

That rule was written to mean *"the private subnet may SSH to the gateway as a
bastion hop."* What it actually says is *"accept any SSH arriving on enp0s8,
whatever local address it is aimed at."* Because `192.168.56.10` is one of
`gw`'s own addresses, traffic from `app` to it is delivered locally and hits
**INPUT**, never **FORWARD** — so the carefully written forward-chain drop was
never consulted.

**Real-world severity here: low.** `app` gains nothing it did not already have,
since `10.0.2.1` and `192.168.56.10` are the same sshd on the same host. But
the *class* of error is serious: a rule that is broader than its author's
intent, in a chain the author was not thinking about. The identical mistake on
a host that bridges a data segment to a management segment is a genuine
management-plane exposure.

**Fix (written, not yet applied):** constrain by destination address, and drop
data-plane traffic aimed at the management network explicitly.

```
iifname "enp0s8" ip daddr 192.168.56.0/24 counter drop
iifname "enp0s8" ip daddr 10.0.2.1 tcp dport 22 counter accept
```

**Why the fix is being held:** the security review agent is auditing `gw` right
now. Changing the ruleset mid-audit would invalidate its evidence and produce a
report describing a system that no longer exists. The fix lands after the audit
returns, and then the isolation tests re-run to confirm. Sequencing a fix behind
an in-flight audit is itself the discipline being practised.

**Lesson:** packets addressed to the router are not routed *through* it. Any
mental model of "the forward chain protects the private subnet" is incomplete —
the forward chain protects everything *behind* the router; the input chain
protects the router itself, and the router is a member of every segment it
touches.

### Also observed

`app` listens on `0.0.0.0:22` and `[::]:22`. Acceptable on a single-NIC host,
but it means sshd binds every future interface too. Worth pinning to an address
once the host gains a second NIC.

---

## 2026-08-11 — Security review by an independent agent, and the fixes

A separate AI agent audited the running lab read-only, with no knowledge of
the build decisions beyond what it could observe. Full report:
`security-review-2026-08-11.md`. **1 High, 5 Medium, 6 Low, 3 Info.**

It independently found the management-address flaw already logged above, which
is the useful kind of corroboration — one finding reached twice by different
routes. It also found two things this build had missed entirely.

### F-01 (High) — a control that existed only in a comment

`lab-setup-gw.sh` carries the line *"Key-based only."* The shipped sshd config
said `PasswordAuthentication yes`, because Debian's default was never
overridden. The user account has a real password hash and `NOPASSWD:ALL` sudo,
there is no fail2ban, and nothing logs authentication failures.

So the actual posture was: a foothold on `app` is **one guessed password away
from root on the router and bastion.**

This is the worst category of finding — not a known gap, but a **false belief**.
A known gap gets defended around. A control that exists in a comment and not in
a config file is invisible, and nobody audits what they think is already done.

Fixed via `harden-hosts.sh` on both guests:
`PasswordAuthentication no`, `KbdInteractiveAuthentication no`,
`PermitRootLogin no`, `MaxAuthTries 3`, `LoginGraceTime 20`. Config validated
with `sshd -t` *before* reload, because a syntax error plus a reload equals a
host reachable only from the console.

The account password is deliberately **kept, not locked** — console login is
the recovery path when a firewall change goes wrong. It simply can no longer
authenticate over the network.

### F-02 (Medium) — confirmed and fixed

The interface-vs-address rule flaw. Fixed with destination-constrained rules
plus an explicit drop, with DHCP left address-agnostic because a client without
a lease broadcasts to 255.255.255.255.

### F-03 (Medium) — the management path was bidirectional

Not previously considered. `gw` could open connections **to the Windows host**
— `192.168.56.1:7680` (Delivery Optimization) and `:8793` both answered. The
design treated the management segment as "how the operator reaches the lab" and
never asked the reverse question: what can the lab reach on the operator?

A compromised bastion is the single worst host to lose, because it is the one
box deliberately allowed to talk to everything. Giving it a path back to the
workstation makes it a bridge out of the lab entirely.

Fixed in the output chain: `oifname "enp0s9" ct state new drop`, with
`established,related` accepted first so replies to the operator's own SSH
session still flow. **A bastion is a door, and a door should only open one way.**

### Verification — all with live counters

| Test | Before | After |
|---|---|---|
| `app` → internet via NAT | http=200 | http=200 |
| `app` → gw private 10.0.2.1 | reachable | reachable |
| `app` → Windows host 192.168.56.1 | blocked | blocked |
| `app` → mgmt IP 192.168.56.10:22 | **REACHED** | **blocked** (6 pkts dropped) |
| `gw` → host 192.168.56.1:7680 | **OPEN** | **blocked** (12 pkts dropped) |
| `gw` → host 192.168.56.1:8793 | **OPEN** | **blocked** |
| `gw` → internet | http=200 | http=200 |
| SSH password auth | **enabled** | disabled, both hosts |

Counters, not assertions. Every "blocked" above is a number that went up.

### The correction that matters most

The agent flagged that **"am-public simulates the internet" is not accurate.**
It is a live NAT route to the real internet *and* to Erick's home LAN. `app`,
which has no external NIC at all, resolved `deb.debian.org` end to end through
`gw`, whose upstream resolver is the actual home router at 192.168.4.1.

Inbound is genuinely closed — no port forwarding on the NAT network, no host
route into the lab subnets — so the exposure is one-directional. But the README
claim was wrong and has been corrected. Also noted: VirtualBox maps
`10.0.1.2` to host loopback by default, a standing pinhole that exposes nothing
today but should be understood rather than discovered later.

### What the audit confirmed was right

Worth recording, because an audit that only lists problems is not an audit:

- **No bridging, no leakage to the home LAN.** Windows IP forwarding disabled
  on every interface, no bridged adapter in any VM, `app` has exactly one
  `intnet` NIC with adapters 2–8 set to `none`. The highest-consequence check
  passes.
- `app` genuinely cannot reach the Windows host — ICMP silent, 22/445/3389/8100
  all filtered.
- Repo hygiene clean: `credentials.txt` outside the repo and untracked, no
  private key material anywhere in the tree, only the public key committed.

---

## 2026-08-11 — Windows Server 2025, and four self-inflicted diagnostic errors

Erick supplied `...SERVER_EVAL_x64FRE_en-us.iso` as "Windows 11 eval".
`VBoxManage unattended detect` read it as `ServerStandardEval`, build
10.0.26100.32230 — **Windows Server 2025**, not a client OS. Build 26100 is the
kernel shared with Windows 11 24H2, which is why the filename reads client-ish.

Role changed to match: the box became a **domain controller** rather than an
employee desktop. Reasoning in `network-design.md` — a server OS makes a poor
pretend workstation, and identity (AD, Kerberos, LDAP, GPO, internal CA) is the
direct ancestor of cloud IAM and worth far more to both target roles. Bonus:
Server has no TPM 2.0 / Secure Boot requirement, so it installed in VirtualBox
without the workarounds a Windows 11 client would have needed, and the eval is
180 days rather than 90.

Installed unattended: image #2 (Standard, Desktop Experience), 4 GB, 2 vCPU,
60 GB, EFI, one NIC on `am-private` with MAC `08:00:27:AA:00:40`.

### ERROR 1 — a monitor that could never have succeeded

The install watcher reported `dc_dhcp_lease=0` for thirty straight minutes. It
was checked with:

```
grep -c ',dc,' /var/lib/misc/dnsmasq.leases
```

`dnsmasq.leases` is **space-delimited**. The commas in that pattern meant it
could not match regardless of what the network did. The lease had been issued
correctly the whole time — `ipconfig` inside the guest showed `10.0.2.40`,
gateway `10.0.2.1`, DNS `10.0.2.1`: exactly the reservation.

This produced a **false negative**, which is the more dangerous direction. A
false positive gets investigated and dismissed; a false negative sends you
hunting a fault that does not exist. Time was nearly spent chasing a missing
Intel NIC driver on a NIC that was working perfectly.

**Rule taken from it:** when a monitor fires, the first question is *"is the
monitor right?"* — validate the check against a known-good case before trusting
it to describe a bad one.

### ERROR 2 — Windows Run dialog silently truncates at ~260 characters

A ~380-character PowerShell command typed into Win+R stopped mid-word at
`New-NetFirewall`. No error, no warning, no ellipsis — just a command that
ended early and would have failed with a confusing syntax error had it run.

Fix: type into a real PowerShell console, which has no such limit. Worth
knowing because the failure is silent and looks like a typing fault.

### ERROR 3 — Guest Additions never installed

`--install-additions` was passed, but only
`/VirtualBox/GuestAdd/HostVerLastChecked` exists as a guest property — no
version, and `guestcontrol` fails with *"The guest execution service is not
ready"*. So the entire scripted-control channel into the Windows guest was
unavailable, and configuration had to be driven with synthetic keystrokes
(`VBoxManage controlvm ... keyboardputscancode/keyboardputstring`) plus
screenshots to verify each step.

Slow, but it worked, and it is worth recording that a headless guest with no
agent is still drivable — the console is an API of last resort.

### ERROR 4 — UAC defaults to "No"

`Start-Process powershell -Verb RunAs` raised a UAC consent dialog with focus
on **No**. Blindly sending Enter would have declined elevation and silently
done nothing. Required Left-arrow then Enter, verified by screenshot.

A reminder that "automate the GUI" means reading the screen, not assuming it.

### Configuration applied

RDP enabled and — importantly — **scoped**:

```
Set-NetFirewallRule -DisplayGroup 'Remote Desktop' -RemoteAddress 10.0.2.0/24
New-NetFirewallRule -DisplayName 'Lab ICMP' -Protocol ICMPv4 -IcmpType 8 `
    -RemoteAddress 10.0.2.0/24 -Action Allow -Direction Inbound
```

Not `-RemoteAddress Any`. A domain controller reachable from anywhere is how
labs quietly teach bad habits. Verified from the router, not from the screen:
`PING_OK`, `RDP_OPEN`.

### Rename pass

Erick asked for names that say what each machine is. Convention adopted in
`network-design.md`: descriptive VirtualBox display names for humans, terse
`am-<role><NN>` hostnames for machines and logs.

| Was | VirtualBox name | Hostname |
|---|---|---|
| `gw` | `02-CORE-Router-Bastion (Debian)` | `am-rtr01` |
| `app` | `03-APP-Server (Debian-Docker)` | `am-app01` |
| `dc` | `05-IDENTITY-DomainController (WinServer2025)` | `am-dc01` |

Sequencing mattered in two places:

- **`am-dc01` was renamed BEFORE promotion.** Renaming a live domain controller
  means touching the AD database, service principal names, and DNS records.
  Renaming a plain member server is a reboot. Ordering turned a bad afternoon
  into a five-minute step.
- **VirtualBox will not rename a running VM**, so all display-name changes
  landed in one coordinated powered-off pass rather than piecemeal.

Confirmed afterwards from the router's lease table — the guests re-registered
under their new names on their reserved addresses:

```
10.0.2.20 am-app01
10.0.2.40 am-dc01
```

### DNS domain moved: `lab.local` -> `corp.internal`

`.local` is reserved for **mDNS** (Bonjour/Avahi). Using it as an Active
Directory domain causes intermittent resolution failures on any host running an
mDNS responder, which is most modern machines.

**ICANN reserved `.internal` in 2024** explicitly as the private-use
replacement for improvised choices like `.local`, `.corp`, and `.lan`. It can
never be delegated publicly, so it cannot collide with a real domain.

Changed in dnsmasq (`domain=`, `local=/corp.internal/`), in `/etc/hosts`, and in
the reservation names — before AD promotion, because the domain name is baked
into the forest at creation and changing it afterwards is a migration.

### FAILURE — renaming a VM broke it, via a stale absolute path

The Linux hosts restarted fine after the VirtualBox rename. `am-dc01` refused
to boot at all:

```
VD: Backend 'VBoxIsoMaker' does not support async I/O (VERR_NOT_SUPPORTED).
VISO: RTVfsChainQueryInfo failed to open
  'C:\Users\Erick\CloudLab\vms\dc\Unattended-...-autounattend.xml': VERR_PATH_NOT_FOUND
AHCI: Failed to attach drive to Port1 (VERR_PATH_NOT_FOUND)
```

**Cause:** `VBoxManage unattended install` builds a *virtual* ISO — a `.viso`
descriptor listing real files by **absolute path** — and leaves it attached to
SATA port 1 after the installation finishes. Renaming the VM moved its folder
from `vms\dc\` to `vms\05-IDENTITY-DomainController (WinServer2025)\`. The
`.viso` file moved with it; the paths *inside* it did not. It still pointed at
`vms\dc\`, which no longer existed, so the VM could not attach its optical
drive and refused to start.

**Fix:** detach the leftover install media, which should have been removed the
moment the installation completed:

```
VBoxManage storageattach '<vm>' --storagectl SATA --port 1 --device 0 \
    --type dvddrive --medium none
```

Both Debian guests had already ejected theirs, which is why only the Windows
guest broke — a difference in install-media handling between the two paths that
was invisible until something moved.

**Lesson, and it is not really about VirtualBox:** installation artifacts that
outlive the installation become latent failures. The `.viso` did no harm for
hours; it broke on the first unrelated change. This is the same class of
problem as a cloud instance that boots fine until it is moved to another AZ and
something references an AZ-scoped resource by hardcoded ID, or a container
image that works until its build-time bind mount disappears.

**Rule taken from it:** teardown of install media belongs in the build script,
not in memory. `build-lab.ps1` should detach install media as the final step of
provisioning rather than leaving it attached "in case."

---

## 2026-08-11 — OPNsense perimeter: a wrong assumption, caught by reading the screen

### WRONG ASSUMPTION — the `vga` image is an installer, not a pre-installed disk

The plan was to skip the installer entirely by converting OPNsense's `vga`
image straight to a VDI and booting it:

```
bzip2 -dk OPNsense-26.7-vga-amd64.img.bz2
VBoxManage convertfromraw OPNsense-26.7-vga-amd64.img opnsense.vdi --format VDI
```

That worked, and the machine booted — to this:

```
Welcome!  OPNsense is running in live mode from install media.  Please
login as 'root' to continue in live mode, or as 'installer' to start the
installation.
```

**Live mode.** The `vga` and `serial` images are *installers* differentiated by
console type, not pre-installed systems. Nothing would have survived a reboot.
Every rule, certificate, and interface assignment would have evaporated, and
the failure would have surfaced days later as "the firewall forgot everything"
— the kind of bug that is miserable to diagnose precisely because the system
appears to work perfectly right up until it restarts.

Caught only because the boot console was actually read rather than skimmed for
absence-of-errors. A screenshot is a cheap habit that keeps paying.

Corrected: fresh 20 GB target disk, the DVD ISO attached as the installer,
boot order set to DVD first — the ordinary install path.

### Interfaces auto-assigned backwards

The live boot also revealed:

```
LAN (em0) -> v4: 192.168.1.1/24
WAN (em1) -> v4/DHCP4: 192.168.56.101/24
```

`em0` is NIC1 (`am-public`, intended WAN); `em1` is NIC2 (host-only, intended
management). OPNsense's first-boot autodetection picks WAN by **which interface
obtains a DHCP lease first**, and the host-only network answered sooner than
the NAT network did.

Worth knowing generally: interface *order* in the hypervisor does not determine
interface *role* in the guest. Anything that auto-assigns roles by observed
behaviour will occasionally observe something different from what was intended.
Roles get pinned explicitly after installation rather than trusted from
autodetection.

### The RAM lesson, a second time — on a different OS

The OPNsense installer refused to proceed:

```
The installer detected only 1023MB of RAM. Since this is a live image,
copying the full file system to another disk requires at least 3000MB
of RAM and is generally advised for good operation.
              [Proceed anyway]    [Cancel]
```

1 GB is the firewall's *runtime* budget and is entirely adequate for it. The
*install* wanted three times that. Raised to 4096 MB for the install, dropped
back to 1024 MB immediately after — exactly the treatment Debian needed.

Twice on unrelated operating systems makes it a pattern rather than an
anecdote:

> **Provisioning is a workload.** It is usually the heaviest one a machine ever
> runs, and it happens exactly once — so it never shows up in capacity planning
> derived from steady-state observation.

This transfers directly to Phase 2/3. An instance type sized from CloudWatch
averages will fail during image builds, migrations, and major-version upgrades
— the moments when a surprise is least welcome. The fix is not a permanently
larger instance; it is recognising that install-time and run-time are separate
sizing problems.

`Proceed anyway` was available and was declined. "It warned me and I ignored
it" is a bad line in a build log.

### PROCESS FAILURE — blind keystroke batching

The second installer boot was driven with a batch of timed keystrokes and no
verification between them. It did not land on the installer: the boot had gone
to *manual interface assignment* instead, so the keystrokes were consumed by a
different wizard, and the down-arrow was read as an interface name:

```
Enter the WAN interface name or 'a' for auto-detection: ^[[B
Invalid interface name ''
```

Harmless by luck. The earlier steps had worked precisely because each screen
was screenshotted and verified before acting, and this one broke the moment
that stopped.

Verification was reinstated, and it earned its keep twice within the next two
minutes:

- The disk selector defaulted to **`cd0` — the DVD**, not the target disk.
  A blind Enter would have aimed the installer at its own installation media.
- Immediately after: `Last Chance! Are you sure you want to destroy the current
  contents of the following disks: ada0`, with **YES** pre-selected.

Two consecutive destructive prompts where the default was either wrong or
irreversible. The argument for verifying is not that a blind script *might*
fail — it is that the failure is unrecoverable when it does.

### Interface roles pinned by MAC, not by autodetection

Autodetection had assigned WAN and LAN backwards, choosing WAN by whichever
interface obtained a DHCP lease first. Roles were pinned explicitly instead,
mapped by hardware address rather than by trust:

| VirtualBox | MAC | OPNsense | Role |
|---|---|---|---|
| NIC1 -> `am-public` | `08:00:27:5c:62:b7` | `em0` | **WAN** |
| NIC2 -> host-only | `08:00:27:cb:9e:70` | `em1` | **LAN / management** |

Confirmed after reassignment: `WAN (em0) -> DHCP 10.0.1.5/24` — the NAT
network, as designed.

### Install media ejected BEFORE first boot

The installer's own closing screen says it plainly:

```
Installation Complete
The system may boot back into the installation media when not ejected properly.
```

**Halt** was chosen over **Reboot** specifically so the DVD could be detached
while powered off, boot order set to disk-only, and RAM returned to 1024 MB —
before the installed system ever started.

This is the same class of problem that killed `am-dc01` earlier in the day,
where leftover unattended-install media held absolute paths and broke the VM
the moment its folder was renamed. Second occurrence, so it is now a rule
rather than an observation: **install media is detached as the final step of
provisioning, always.** Encoded in `build-lab.ps1` as `Complete-VM`.

### `am-fw01` live — web console reachable

Console after applying:

```
You can now access the web GUI by opening the following URL in your web browser:
    https://192.168.56.20

LAN (em1) -> v4: 192.168.56.20/24
WAN (em0) -> v4/DHCP4: 10.0.1.5/24
```

Verified from Windows, not from the console: `ping` OK and TCP/443 open.
Reading "you can now access" on a screen is not evidence that anything can.

Choices made during the interface wizard, each for a reason:

| Prompt | Answer | Why |
|---|---|---|
| Configure LAN via DHCP | **No** | A firewall's management address must not depend on a lease |
| LAN IPv4 | `192.168.56.20/24` | Joins the existing host-only management segment; default was `192.168.1.1`, unreachable from this host |
| LAN upstream gateway | **none** | A LAN interface with a gateway creates a second default route and asymmetric routing |
| IPv6 via WAN tracking / DHCP6 | **No** | The audit already flagged that the `inet` ruleset's IPv6 handling is untested. Enabling an address family nothing is filtering yet would open a path around every rule written so far |
| Enable DHCP server on LAN | **No** | VirtualBox's host-only network already serves DHCP here — it handed this box `192.168.56.101` earlier. Two DHCP servers on one segment is a classic cause of intermittent, hard-to-diagnose address conflicts |
| Web GUI protocol HTTPS -> HTTP | **No** | Management plane stays encrypted even on a lab segment |
| Restore web GUI access defaults | **Yes** | Restores the anti-lockout rule after the address change. Locking yourself out of a firewall's own management interface is the classic own-goal, and the recovery is console-only |

Root password generated (20 chars) and stored in
`C:\Users\Erick\CloudLab\build\credentials.txt` — outside the repo, untracked.

**Current state of the lab:**

| VirtualBox | Hostname | Role | Status |
|---|---|---|---|
| `01-EDGE-Firewall (OPNsense)` | `OPNsense.internal` | Perimeter firewall, IDS-capable, web console | **Live, GUI reachable** |
| `02-CORE-Router-Bastion (Debian)` | `am-rtr01` | Router, NAT, DHCP/DNS, bastion | Live, hardened, audited |
| `03-APP-Server (Debian-Docker)` | `am-app01` | Application tier | Live, isolated |
| `05-IDENTITY-DomainController (WinServer2025)` | `am-dc01` | Windows Server 2025, future AD | Live, RDP scoped |

`am-fw01` is not yet in the traffic path — it sits alongside the lab with a WAN
on `am-public` and management on host-only. Moving `am-rtr01` behind it is the
next step and follows `scripts/replumb-behind-firewall.md`: add the new uplink
first, verify, then remove the old one.

---

## 2026-08-11 — Replumb: the router now sits behind the perimeter

### Topology change

```
BEFORE:  internet ── am-public ── am-rtr01 ── am-private ── app/dc
AFTER:   internet ── am-public ── am-fw01 ── am-edge ── am-rtr01 ── am-private ── app/dc
```

Two firewalls in series: an appliance doing north-south filtering at the
perimeter, and a host firewall doing east-west segmentation inside. Not
redundancy — the audit already proved the host firewall catches traffic the
perimeter never sees, because `am-app01` talking to `am-rtr01` never crosses
the perimeter at all.

### Order of operations (the part that mattered)

1. Firewall's inside NIC moved from host-only to `am-edge`, addressed `10.0.0.1/24`
2. **Second uplink ADDED to the router** on `am-edge` (`10.0.0.10/24`) while the
   original `am-public` uplink stayed live
3. Path proved with a single host route before committing anything:
   `ip route add 1.1.1.1/32 via 10.0.0.1` -> `ping 1.1.1.1` returned in 13 ms
4. Default route switched, firewall rules re-applied with `WAN=enp0s10`
5. Only then was the original uplink removed

Never remove a working path to test its replacement. Step 3 is what made steps
4 and 5 boring.

### FAILURE — `set -o pipefail` + `head` killed the cutover mid-flight

The cutover script exited **141** (SIGPIPE) at:

```
ip route | head -4
```

`head` closes the pipe after four lines; `ip` gets SIGPIPE; `pipefail` promotes
that to a script failure; `set -e` aborts. The script died **after switching
the default route but before applying the matching firewall rules** — the exact
half-applied state a change like this must never be left in. The private subnet
had a route out and no NAT rule to use it.

Recovered in under a minute because the rollback timer was already armed and
the management path was never in the blast radius. The damage window was
bounded by design, not by luck.

**Lesson:** a diagnostic `| head` inside a change script is not free. Under
`pipefail` it is an abort condition, and putting cosmetic output in the middle
of a state transition means cosmetics can halt the transition. Print state
before or after the change, never between two halves of it.

### CONFIG DRIFT — the script no longer matched the machine

Before re-applying `gw-configure.sh`, a read of it showed the dnsmasq stanza
still said `domain=lab.local` with reservations named `app`/`db` and **no entry
for the domain controller**. Those had been changed live with `sed` during the
rename pass and never written back to the script.

Re-running it would have silently reverted the domain to `lab.local` — the
exact mDNS collision the rename existed to avoid — and dropped `am-dc01`'s
reservation.

Caught by reading before running. Fixed by syncing the script to the live
state, and the interface names were parameterised at the same time
(`WAN`/`LAN`/`MGMT` now substitute into the ruleset instead of being hardcoded
in three places — the kind of thing that gets updated in two).

**Lesson:** the moment a live system is changed by hand, the script that built
it is wrong. Idempotent scripts are only safe if they are also *current*; an
out-of-date idempotent script is a reliable way to undo yesterday's work.

### Verified after cutover

```
am-rtr01 interfaces:  enp0s8 10.0.2.1   (private)
                      enp0s9 192.168.56.10 (management)
                      enp0s10 10.0.0.10 (uplink -> firewall)
                      enp0s3: GONE
default via 10.0.0.1 dev enp0s10

router egress:  http=200
app egress:     http=200
app DNS:        resolves via the router
app -> Windows host:      blocked
app -> management IP:     blocked
am-dc01 RDP:              UP
```

Firewall counters, which are the actual evidence:

```
15 packets  iifname "enp0s8"  oifname "enp0s10" accept     <- private egress
 5 packets  iifname "enp0s10" oifname "enp0s8"  drop       <- inbound refused
 8 packets  oifname "enp0s10" masquerade                   <- NAT
```

The inbound drop counter is non-zero. Something on the edge segment attempted
to reach the private subnet and was refused — which is precisely why that rule
was written with an explicit `counter` rather than left to the chain policy.
A silent policy drop would have shown nothing at all.
