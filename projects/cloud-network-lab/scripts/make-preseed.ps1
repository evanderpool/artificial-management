<#
    Generate a VBoxManage-compatible Debian preseed for one lab node.

    The node's setup script is base64-encoded into the preseed's late_command,
    so no quoting has to survive the PowerShell -> VBoxManage -> preseed ->
    shell chain. See the build log for why that mattered.

    Usage:
        .\make-preseed.ps1 -Name gw  -SetupScript .\lab-setup-gw.sh
        .\make-preseed.ps1 -Name app -SetupScript .\lab-setup-node.sh
        .\make-preseed.ps1 -Name db  -SetupScript .\lab-setup-node.sh `
                           -ExtraPackages 'postgresql'
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Name,
    [Parameter(Mandatory)][string]$SetupScript,
    [string]$ExtraPackages = '',
    [string]$OutDir = "C:\Users\Erick\CloudLab\build"
)

$ErrorActionPreference = 'Stop'

$sh  = (Get-Content $SetupScript -Raw) -replace "`r`n", "`n"
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($sh))

$packages = 'openssh-server nftables tcpdump curl ca-certificates net-tools'
if ($Name -eq 'gw') { $packages += ' dnsmasq' }
if ($ExtraPackages)  { $packages += " $ExtraPackages" }

$preseed = @'
### Cloud Network Lab -- __NAME__ preseed (custom template for VBoxManage unattended)
### Partitioning
d-i partman-auto/disk string /dev/sda
d-i partman-auto/method string regular
d-i partman-lvm/device_remove_lvm boolean true
d-i partman-md/device_remove_md boolean true
d-i partman-auto/choose_recipe select atomic
d-i partman-partitioning/confirm_write_new_label boolean true
d-i partman/choose_partition select finish
d-i partman/confirm boolean true
d-i partman/confirm_nooverwrite boolean true

# Locale / keyboard
d-i debian-installer/locale string @@VBOX_INSERT_LOCALE@@
d-i console-setup/ask_detect boolean false
d-i console-setup/layoutcode string us
d-i keyboard-configuration/xkb-keymap select us

# Network -- installed with NIC1 only attached, so "auto" is unambiguous.
d-i netcfg/choose_interface select auto
d-i netcfg/get_hostname string @@VBOX_INSERT_HOSTNAME_WITHOUT_DOMAIN@@
d-i netcfg/get_domain string @@VBOX_INSERT_HOSTNAME_DOMAIN@@

# Clock
@@VBOX_COND_IS_RTC_USING_UTC@@
d-i clock-setup/utc-auto boolean true
d-i clock-setup/utc boolean true
@@VBOX_COND_END@@
@@VBOX_COND_IS_NOT_RTC_USING_UTC@@
d-i clock-setup/utc-auto boolean false
d-i clock-setup/utc boolean false
@@VBOX_COND_END@@
d-i time/zone string @@VBOX_INSERT_TIME_ZONE_UX@@
d-i clock-setup/ntp boolean true

# Mirror
d-i base-installer/kernel/override-image string linux-image-amd64
d-i pkgsel/install-language-support boolean false
d-i apt-setup/use_mirror boolean true
d-i mirror/country string manual
d-i mirror/http/hostname string deb.debian.org
d-i mirror/http/directory string /debian
d-i mirror/http/proxy string

# Headless: standard system utilities only -- no desktop environment.
tasksel tasksel/first multiselect standard
d-i pkgsel/include string __PACKAGES__
d-i pkgsel/upgrade select none
popularity-contest/participate boolean false

# Users -- root login disabled, erick in sudo group.
d-i passwd/user-fullname string @@VBOX_INSERT_USER_FULL_NAME@@
d-i passwd/username string @@VBOX_INSERT_USER_LOGIN@@
d-i passwd/user-password-crypted password @@VBOX_INSERT_USER_PASSWORD_SHACRYPT512@@
d-i passwd/root-login boolean false
d-i passwd/user-default-groups string sudo

# Grub
d-i grub-installer/grub2_instead_of_grub_legacy boolean true
d-i grub-installer/only_debian boolean true
d-i grub-installer/bootdev string default

d-i finish-install/reboot_in_progress note

# Custom setup delivered base64-encoded to avoid quoting problems.
d-i preseed/late_command string echo '__B64__' | base64 -d > /target/root/lab-setup.sh \
 && chroot /target /bin/bash /root/lab-setup.sh
'@

$preseed = $preseed.Replace('__NAME__', $Name).Replace('__PACKAGES__', $packages).Replace('__B64__', $b64)

$out = Join-Path $OutDir "$Name-preseed.cfg"
[IO.File]::WriteAllText($out, ($preseed -replace "`r`n","`n"), (New-Object Text.UTF8Encoding $false))
Write-Host "wrote $out ($((Get-Item $out).Length) bytes, packages: $packages)"
