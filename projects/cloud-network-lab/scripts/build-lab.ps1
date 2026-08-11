<#
    Cloud Network Lab — rebuild the whole Phase 1 lab from nothing.

    This is the local-hypervisor ancestor of the Terraform that replaces it in
    Phase 3. Every resource it declares has a cloud equivalent named in the
    project README's mapping table.

    Usage:
        .\build-lab.ps1                  # build everything
        .\build-lab.ps1 -Only gw         # one VM
        .\build-lab.ps1 -Destroy         # tear the lab down

    Prerequisites: VirtualBox >= 7.0, the verified Debian netinst ISO in
    $LabRoot\iso, and an SSH keypair at $LabRoot\build\lab_key.
#>
[CmdletBinding()]
param(
    [string]$LabRoot = "C:\Users\Erick\CloudLab",
    [string]$Iso     = "C:\Users\Erick\CloudLab\iso\debian-13.6.0-amd64-netinst.iso",
    [ValidateSet('gw','app','db','all')][string]$Only = 'all',
    [switch]$Destroy
)

$ErrorActionPreference = 'Stop'
$VBM = "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe"

# --- Lab definition ---------------------------------------------------------
# InstallMem is deliberately higher than RunMem: Debian's installer enters an
# interactive low-memory mode below ~1GB, which stalls an unattended build.
# Size for the peak of the lifecycle, not the average of the workload.
# Name     = VirtualBox display name. Numeric prefix forces the GUI to list the
#            machines in network order, so the VM list reads as a diagram.
# Hostname = what the guest calls itself. Lowercase, DNS-safe, <=15 chars so
#            Windows NetBIOS never truncates it.
$VMs = @(
    @{ Name='02-CORE-Router-Bastion (Debian)'; Hostname='am-rtr01';
       RunMem=768;  InstallMem=2048; Disk=8192;  Mac=$null;
       Nics=@(
         @{ Slot=1; Type='natnetwork'; Net='am-public'  }
         @{ Slot=2; Type='intnet';     Net='am-private' }
         @{ Slot=3; Type='hostonly';   Net='VirtualBox Host-Only Ethernet Adapter' }
       ) }
    @{ Name='03-APP-Server (Debian-Docker)'; Hostname='am-app01';
       RunMem=2048; InstallMem=2048; Disk=8192;  Mac='080027AA0020';
       Nics=@( @{ Slot=1; Type='intnet'; Net='am-private' } ) }
    @{ Name='04-DATA-Database (Postgres-pgvector)'; Hostname='am-db01';
       RunMem=1536; InstallMem=2048; Disk=12288; Mac='080027AA0030';
       Nics=@( @{ Slot=1; Type='intnet'; Net='am-private' } ) }
    @{ Name='05-IDENTITY-DomainController (WinServer2025)'; Hostname='am-dc01';
       RunMem=4096; InstallMem=4096; Disk=61440; Mac='080027AA0040';
       Nics=@( @{ Slot=1; Type='intnet'; Net='am-private' } ) }
)

function Invoke-VBox { & $VBM @args 2>&1 | Out-String }

function Test-VMExists([string]$n) {
    (& $VBM list vms 2>$null) -match "^`"$n`""
}

# --- Teardown ---------------------------------------------------------------
if ($Destroy) {
    foreach ($vm in $VMs) {
        if (Test-VMExists $vm.Name) {
            Write-Host "destroying $($vm.Name)"
            Invoke-VBox controlvm $vm.Name poweroff | Out-Null
            Start-Sleep -Seconds 2
            Invoke-VBox unregistervm $vm.Name --delete | Out-Null
        }
    }
    if ((& $VBM list natnetworks) -match 'am-public') {
        Invoke-VBox natnetwork remove --netname am-public | Out-Null
    }
    Write-Host "lab destroyed. (host-only adapter left in place)"
    return
}

# --- Networks ---------------------------------------------------------------
# am-public   : NAT Network, 10.0.1.0/24, DHCP  -> AWS VPC + Internet Gateway
# am-private  : Internal Network, no DHCP, no route out except through gw
#               -> AWS private subnet
# host-only   : 192.168.56.0/24 management path -> bastion admin access
if (-not ((& $VBM list natnetworks) -match 'am-public')) {
    Write-Host "creating NAT network am-public (10.0.1.0/24)"
    Invoke-VBox natnetwork add --netname am-public --network "10.0.1.0/24" --enable --dhcp on | Out-Null
}

$hostonly = ((& $VBM list hostonlyifs) | Select-String '^Name:\s+(.+)$').Matches.Groups[1].Value
if (-not $hostonly) { throw "No host-only adapter found. Create one in the VirtualBox GUI (needs elevation)." }

# --- Credentials ------------------------------------------------------------
$credFile = Join-Path $LabRoot 'build\credentials.txt'
if (-not (Test-Path $credFile)) { throw "Missing $credFile — generate the lab password first." }
$pw = ((Get-Content $credFile | Where-Object { $_ -match '^lab password: ' }) -replace '^lab password: ','').Trim()

# --- Build ------------------------------------------------------------------
foreach ($vm in $VMs) {
    if ($Only -ne 'all' -and $Only -ne $vm.Name) { continue }
    $n = $vm.Name
    if (Test-VMExists $n) { Write-Host "$n already exists — skipping"; continue }

    Write-Host "=== building $n ==="
    Invoke-VBox createvm --name $n --ostype Debian_64 --register --basefolder "$LabRoot\vms" | Out-Null

    # Install with the FIRST NIC ONLY. With several NICs carrying link but only
    # one carrying DHCP, `netcfg/choose_interface select auto` is a coin flip.
    # The rest are attached after installation; their static config is written
    # during the install and lies inert until the NICs appear.
    $first = $vm.Nics[0]
    $args = @('modifyvm', $n, '--memory', $vm.InstallMem, '--cpus', 1, '--vram', 12,
              '--usb','off','--audio-driver','none','--boot1','dvd','--boot2','disk',
              "--nic$($first.Slot)", $first.Type)
    switch ($first.Type) {
        'natnetwork' { $args += @("--nat-network$($first.Slot)", $first.Net) }
        'intnet'     { $args += @("--intnet$($first.Slot)",      $first.Net) }
        'hostonly'   { $args += @("--host-only-adapter$($first.Slot)", $first.Net) }
    }
    if ($vm.Mac) { $args += @("--macaddress$($first.Slot)", $vm.Mac) }
    Invoke-VBox @args | Out-Null

    Invoke-VBox createmedium disk --filename "$LabRoot\vms\$n\$n.vdi" --size $vm.Disk --format VDI | Out-Null
    Invoke-VBox storagectl $n --name SATA --add sata --controller IntelAhci --portcount 4 --bootable on | Out-Null
    Invoke-VBox storageattach $n --storagectl SATA --port 0 --device 0 --type hdd --medium "$LabRoot\vms\$n\$n.vdi" | Out-Null

    $preseed = "$LabRoot\build\$n-preseed.cfg"
    if (-not (Test-Path $preseed)) { throw "Missing preseed $preseed — run make-preseed.ps1 for $n first." }

    Write-Host "starting unattended install of $n (this takes ~10 minutes)"
    Invoke-VBox unattended install $n --iso=$Iso --user=erick --password=$pw `
        --full-user-name="Erick Vanderpool" --hostname="$n.lab.local" `
        --time-zone="America/New_York" --locale=en_US --country=US `
        --script-template=$preseed `
        --post-install-template="C:\Program Files\Oracle\VirtualBox\UnattendedTemplates\debian_postinstall.sh" `
        --start-vm=headless | Out-Null

    Write-Host "$n installing. When it finishes: run Complete-VM below."
}

<#
    After an install completes, finish the VM with:

        VBoxManage controlvm <n> acpipowerbutton
        VBoxManage modifyvm  <n> --memory <RunMem>        # drop install-time RAM
        VBoxManage modifyvm  <n> --boot1 disk --boot2 dvd

        # DETACH INSTALL MEDIA -- not optional. `unattended install` leaves a
        # .viso attached whose contents reference files by ABSOLUTE path. It is
        # harmless until the VM folder moves (e.g. a rename), at which point the
        # VM will not boot at all: VERR_PATH_NOT_FOUND on the optical drive.
        # Cost us a dead DC after the rename pass -- see the build log.
        VBoxManage storageattach <n> --storagectl SATA --port 1 --device 0 `
            --type dvddrive --medium none
        VBoxManage storageattach <n> --storagectl SATA --port 2 --device 0 `
            --type dvddrive --medium none

        VBoxManage modifyvm  <n> --nic2 intnet   --intnet2 am-private
        VBoxManage modifyvm  <n> --nic3 hostonly --host-only-adapter3 "<adapter>"
        VBoxManage startvm   <n> --type headless

    Kept manual on purpose: the memory drop and NIC attach both require the VM
    to be powered off, and detecting "install finished" reliably on a headless
    guest with no guest additions is its own problem — see the build log.
#>

function Complete-VM {
    <#  Finish a VM after its unattended install: drop to runtime RAM, detach
        install media, attach the remaining NICs, boot. Run with the VM off. #>
    param([Parameter(Mandatory)][string]$Name)

    $vm = $VMs | Where-Object { $_.Name -eq $Name }
    if (-not $vm) { throw "Unknown VM '$Name'" }

    Invoke-VBox modifyvm $Name --memory $vm.RunMem --boot1 disk --boot2 dvd | Out-Null

    # Install media MUST go. See the comment block above.
    foreach ($port in 1,2) {
        Invoke-VBox storageattach $Name --storagectl SATA --port $port --device 0 `
                    --type dvddrive --medium none | Out-Null
    }

    foreach ($nic in ($vm.Nics | Select-Object -Skip 1)) {
        $a = @('modifyvm', $Name, "--nic$($nic.Slot)", $nic.Type)
        switch ($nic.Type) {
            'natnetwork' { $a += @("--nat-network$($nic.Slot)", $nic.Net) }
            'intnet'     { $a += @("--intnet$($nic.Slot)",      $nic.Net) }
            'hostonly'   { $a += @("--host-only-adapter$($nic.Slot)", $nic.Net) }
        }
        Invoke-VBox @a | Out-Null
    }

    Invoke-VBox startvm $Name --type headless | Out-Null
    Write-Host "$Name completed and started (RAM $($vm.RunMem)MB, install media detached)"
}
