#!/bin/bash
# Cloud Network Lab — SSH hardening, applied to every Linux guest.
#
# Written in response to security review finding F-01 (High), 2026-08-11:
# both hosts shipped with `PasswordAuthentication yes` while the build script
# claimed "Key-based only". A control that exists in a comment and not in the
# config is not a control — it is a false belief, which is worse than a known
# gap because nobody goes looking for it.
#
# Run as root on each guest. Idempotent.
set -euo pipefail

install -d -m 755 /etc/ssh/sshd_config.d

cat > /etc/ssh/sshd_config.d/99-lab-hardening.conf <<'EOF'
# Cloud Network Lab hardening — see security-review-2026-08-11.md (F-01)

# Keys only. The lab user still HAS a password because console access is the
# recovery path when a firewall change goes wrong, but it can no longer be used
# to authenticate over the network. Locking the account outright would remove
# the only way back in from the VirtualBox console.
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitEmptyPasswords no

# Root never logs in over the network.
PermitRootLogin no

# Reduce the pre-authentication attack surface.
MaxAuthTries 3
LoginGraceTime 20
X11Forwarding no
AllowTcpForwarding yes
EOF

chmod 644 /etc/ssh/sshd_config.d/99-lab-hardening.conf

# Validate BEFORE reloading. A syntax error here plus a reload equals a host
# reachable only from the console.
sshd -t

systemctl reload ssh

echo "=== effective sshd settings ==="
sshd -T | grep -Ei '^(passwordauthentication|permitrootlogin|kbdinteractiveauthentication|permitemptypasswords|maxauthtries|logingracetime)'
echo "OK"
