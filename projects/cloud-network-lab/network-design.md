# Network Design — Artificial Management Reference Business Network

**Status:** Proposed 2026-08-11, expanding the Phase 1 lab at Erick's direction
**Driver:** the lab should resemble a real small-business network, not a
three-box routing demo — multiple operating systems, real isolation zones,
containers doing specific jobs, and a security posture that has been audited
rather than asserted.

---

## Design principle: zones, not machines

A business network is not a list of servers. It is a set of **trust zones**
with deliberately controlled paths between them. Every host below exists to
occupy a zone, and the interesting engineering is in what may cross a boundary
— not in the boxes themselves.

```
                        ( simulated internet )
                                 │
                        ┌────────▼────────┐
       ZONE 0 EDGE      │       fw        │  OPNsense (FreeBSD)
                        │  firewall/IDS   │  web console, Suricata, VPN
                        └───┬─────────┬───┘
                            │         │
        ┌───────────────────┘         └──────────────┐
        │                                            │
  ┌─────▼─────┐  ZONE 1 DMZ                   ┌──────▼──────┐  ZONE 4 USER
  │    dmz    │  Alpine + Docker              │     ws      │  desktop OS
  │  reverse  │  assumed hostile              │ workstation │  most likely
  │   proxy   │                               │             │  compromise
  └─────┬─────┘                               └──────┬──────┘
        │                                            │
        └──────────────┬─────────────────────────────┘
                       │
                 ┌─────▼─────┐  ZONE 2 SERVER
                 │    gw     │  Debian — hand-built router / bastion
                 │  nftables │  internal segmentation + DHCP/DNS
                 └─────┬─────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
  │    app    │  │    db     │  │    sec    │
  │  Debian   │  │  Debian   │  │  Debian   │
  │  +Docker  │  │ Postgres  │  │ log/IDS   │
  │           │  │ +pgvector │  │  console  │
  │  ZONE 2   │  │  ZONE 3   │  │  ZONE 5   │
  │           │  │ NO EGRESS │  │  MGMT     │
  └───────────┘  └───────────┘  └───────────┘
```

---

## What each host does, and why that OS

| Host | OS | Zone | Job | Why this OS specifically |
|---|---|---|---|---|
| `fw` | **OPNsense** (FreeBSD) | 0 Edge | Perimeter firewall, NAT, IDS/IPS (Suricata), VPN terminator, web admin console | A real appliance real businesses actually deploy. FreeBSD's `pf` is a different firewall language from `nftables` — learning both is the point. Gives the lab a genuine GUI without putting a desktop on a server. |
| `gw` | **Debian 13** | 2 Server | Internal router, bastion/jump host, DHCP + DNS for the private subnet, host firewall | Already built by hand with `nftables`. Kept deliberately: building the router manually *then* putting an appliance in front of it is defence-in-depth **and** the same "by hand, then by product" arc the whole project is built on. |
| `dmz` | **Alpine Linux** + Docker | 1 DMZ | Reverse proxy (Caddy) with TLS termination, WAF | ~150 MB installed. A DMZ host is assumed hostile, so it should carry the least software that can possibly do the job. Alpine's small surface is the argument for it here — and it teaches a second package manager and init system in the one place that justifies the cost. |
| `app` | **Debian 13** + Docker | 2 Server | Business application containers | Matches what runs on a cloud instance. Docker here demonstrates containers as a *deployment* boundary, not a security one. |
| `db` | **Debian 13** | 3 Data | PostgreSQL + pgvector. **No egress whatsoever.** | The crown jewels. Bare-metal Postgres rather than a container, on its own VM, to make the isolation argument concrete. |
| `sec` | **Debian 13** + Docker | 5 Mgmt | Log collection, IDS event console, metrics | The audit plane must not live on what it audits. |
| `ws` | **Windows 11** or **Xubuntu** | 4 User | Employee workstation | The realistic entry point for a real attack. Also the machine that legitimately has a desktop. |

---

## Security vs privacy — they are not the same thing

Erick asked which components provide security and which provide privacy. Worth
separating precisely, because conflating them is how systems end up with a
strong front door and a wide-open back one.

### Security = controlling what comes IN, and limiting movement once in

| Control | Where | Protects against |
|---|---|---|
| Perimeter firewall rules | `fw` (pf) | Unsolicited inbound from the internet |
| IDS/IPS (Suricata) | `fw` | Known-bad traffic patterns; gives *detection*, not just blocking |
| Host firewalls (`nftables`) | every Linux host | East-west movement after a single host falls |
| Forward chain `policy drop` | `gw` | Any path from public into the private subnet |
| SSH keys only, no passwords | all hosts | Credential guessing |
| Bastion-only access | `gw` | Direct reachability of internal hosts |
| Container isolation | `app`, `dmz` | One compromised service reaching its neighbours |

### Privacy = controlling what goes OUT, and where data is allowed to live

| Control | Where | Protects against |
|---|---|---|
| **`db` has no default route at all** | `db` | Exfiltration. A compromised database cannot call home because it has nowhere to call. |
| Egress filtering | `fw`, `gw` | Malware beaconing from any internal host |
| Internal-only DNS | `gw` dnsmasq | Query logs leaking what the business looks up |
| TLS inside the network | `dmz` Caddy internal CA | Plaintext capture on internal segments |
| Logs stay on `sec` | `sec` | Operational data leaving the environment |
| No bridged adapter anywhere | hypervisor | **The lab touching Erick's real home LAN** |

The bridge between the two ideas is **egress filtering**. Almost every real
breach becomes a *data* incident at the moment compromised infrastructure is
allowed to talk outbound. Inbound rules are the part everyone writes; outbound
rules are the part that decides how bad it gets.

---

## Four isolation boundaries, ranked by strength

Stated explicitly because the ranking drives every placement decision above.

| Strength | Boundary | Used for |
|---|---|---|
| Strongest | **Hypervisor / VM** | Separating zones from each other |
| Strong | **Network segment** (VirtualBox Internal Network) | Making `am-private` genuinely unreachable, not merely unrouted |
| Medium | **Firewall rules** | Controlling permitted paths between segments |
| Weakest | **Container** (namespaces + cgroups, shared kernel) | Separating co-operating services on one host |

This is why `db` is a VM and not a container on `app`. A container shares the
host kernel; a kernel-level escape crosses it. For the data zone that is not an
acceptable trade, and saying so out loud is the difference between using
containers and understanding them.

**Technical note:** Docker inside these VMs needs no nested virtualization.
Linux containers are kernel namespaces and cgroups, not virtual machines — so
they run fine inside VirtualBox on a host whose VT-x is already owned by the
Windows hypervisor.

---

## Container assignments — specific jobs, not general-purpose boxes

| Host | Container | Job |
|---|---|---|
| `dmz` | Caddy | TLS termination + reverse proxy to `app` |
| `dmz` | CrowdSec *(optional)* | Behavioural blocking at the edge |
| `app` | business web app | The actual service being protected |
| `app` | Redis | Cache — demonstrates service-to-service policy |
| `sec` | Loki + Grafana | Log aggregation and dashboards |
| `sec` | Prometheus | Metrics |
| `db` | *(none — bare metal)* | Deliberate. See isolation ranking. |

---

## Cloud mapping, extended

The Phase 1 table still holds; the expansion adds rows.

| Lab | AWS | Azure |
|---|---|---|
| `fw` OPNsense | Network Firewall + IGW | Azure Firewall |
| Suricata IDS | GuardDuty | Microsoft Defender for Cloud |
| `dmz` zone | Public subnet + ALB | Public subnet + App Gateway |
| `gw` nftables | Security Groups + NACLs | NSGs |
| `app` zone | Private subnet + ECS/EKS | Private subnet + AKS |
| `db` no-egress zone | Isolated subnet, no NAT route, RDS | Isolated subnet + Private Endpoint |
| `sec` | CloudWatch + Security Hub | Log Analytics + Sentinel |
| `ws` | Client VPN / WorkSpaces | Azure Virtual Desktop |

---

## Resource budget — honest version

Host is an i7-6700: **4 physical cores / 8 threads**, 31.8 GB RAM.

| Host | RAM (run) | Install-time RAM |
|---|---|---|
| `fw` OPNsense | 1024 MB | 1024 MB |
| `gw` | 768 MB | 2048 MB |
| `dmz` Alpine | 768 MB | 1024 MB |
| `app` | 2048 MB | 2048 MB |
| `db` | 1536 MB | 2048 MB |
| `sec` | 2048 MB | 2048 MB |
| `ws` (Linux) | 2048 MB | 2048 MB |
| `ws` (Windows 11) | 4096 MB | 4096 MB |
| **Total (Linux ws)** | **~10.2 GB** | — |
| **Total (Windows ws)** | **~12.2 GB** | — |

RAM is not the constraint — **CPU is**. Seven VMs on four physical cores will
feel slow if all are busy at once. The lab is therefore designed to run in
**scenarios** rather than all-on:

- *Routing / segmentation work*: `fw` + `gw` + `app` (~3.8 GB)
- *Data tier work*: add `db` (~5.4 GB)
- *Security review*: add `sec` (~7.4 GB)
- *Full end-to-end demo*: everything, briefly, for the case-study recording

Stating this constraint up front is itself the exercise. Capacity planning is
the part of infrastructure work that gets skipped until it hurts.

---

## Build order

1. ~~`gw` — hand-built router, NAT, firewall, DHCP/DNS~~ **done 2026-08-11**
2. ~~`app` — private subnet, installed through the gateway~~ **done 2026-08-11**
3. Security audit of what exists *(agent-run, 2026-08-11)*
4. `db` — Postgres + pgvector, **egress removed**
5. `fw` — OPNsense perimeter in front of `gw`
6. `dmz` — Alpine + Caddy
7. `sec` — log/IDS console
8. `ws` — workstation
9. Full re-audit, then the case study

Each step is a build-log entry. Each failure stays in.
