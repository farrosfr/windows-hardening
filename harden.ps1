# harden.ps1 - Un-bypassable Windows Hardening
# Author: Farros FR (https://github.com/farrosfr)

# 1. Check for Admin Privileges
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Please run this script as Administrator."
    exit
}

Write-Host "Starting Multi-Layer Windows Hardening..." -ForegroundColor Cyan

# 2. OS Adapter Layer: Force OpenDNS FamilyShield on ALL adapters
Write-Host "[+] Layer 2: Setting System-wide DNS..." -ForegroundColor Green
$dnsIpv4 = @("208.67.222.123", "208.67.220.123")
$dnsIpv6 = @("2620:119:35::123", "2620:119:53::123")
Get-NetAdapter | Set-DnsClientServerAddress -ServerAddresses $dnsIpv4
Get-NetAdapter | Set-DnsClientServerAddress -ServerAddresses $dnsIpv6 -ErrorAction SilentlyContinue

# 3. Browser Layer: Lock DNS over HTTPS (DoH) via Registry Policies
Write-Host "[+] Layer 3: Locking Browser DoH Policies..." -ForegroundColor Green
$dohTemplate = "https://doh.familyshield.opendns.com/dns-query"
$browserPaths = @(
    "HKLM:\SOFTWARE\Policies\Google\Chrome",
    "HKLM:\SOFTWARE\Policies\Microsoft\Edge",
    "HKLM:\SOFTWARE\Policies\Mozilla\Firefox\DNSOverHTTPS",
    "HKLM:\SOFTWARE\Policies\BraveSoftware\Brave"
)

foreach ($path in $browserPaths) {
    if (!(Test-Path $path)) { New-Item -Path $path -Force | Out-Null }
    if ($path -like "*Mozilla*") {
        Set-ItemProperty -Path $path -Name "Enabled" -Value 1 -Type DWord
        Set-ItemProperty -Path $path -Name "Locked" -Value 1 -Type DWord
        Set-ItemProperty -Path $path -Name "ProviderURL" -Value $dohTemplate -Type String
    } else {
        Set-ItemProperty -Path $path -Name "DnsOverHttpsMode" -Value "secure" -Type String
        Set-ItemProperty -Path $path -Name "DnsOverHttpsTemplates" -Value $dohTemplate -Type String
    }
}

# 4. Search Layer: Modify Hosts for SafeSearch Enforcement
Write-Host "[+] Layer 4: Modifying Hosts for SafeSearch..." -ForegroundColor Green
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$safeSearchEntries = @"

# SafeSearch Enforcement
216.239.38.120 www.google.com
216.239.38.120 google.com
216.239.38.120 www.youtube.com
204.79.197.220 www.bing.com
52.149.246.39 safe.duckduckgo.com
0.0.0.0 startpage.com
"@
$safeSearchEntries | Out-File -FilePath $hostsPath -Append -Encoding ascii

# 6. Firewall Layer: Block Malicious & Piracy IPs
Write-Host "[+] Layer 6: Applying Outbound Firewall Rules..." -ForegroundColor Green
$blockedIPs = "162.244.93.0/24", "195.63.129.0/24", "139.59.72.0/24", "167.71.201.0/24", "139.59.34.0/24", "165.232.170.0/24", "146.190.87.0/24", "129.212.208.0/24","159.203.161.0/24","165.245.144.0/24","143.110.182.0/24","154.93.72.0/24","159.223.73.0/24"
New-NetFirewallRule -DisplayName "Block Content Filtering Bypasses" -Direction Outbound -Action Block -RemoteAddress $blockedIPs -ErrorAction SilentlyContinue

Write-Host "Hardening Complete! Please restart your browser." -ForegroundColor Cyan
