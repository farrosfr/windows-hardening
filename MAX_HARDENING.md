# Maximum Hardening Guide: Strategic "Defense-in-Depth"

To achieve the highest level of content filtering and prevent bypasses, the NoA suite employs a **multi-layered defense strategy**. This guide explains the logic behind the core layers of the [harden.ps1](https://github.com/farrosfr/noa/blob/main/harden.ps1) script and how they work together to create a robust, un-bypassable environment.

---

## 1. OS Adapter Layer: System-Wide DNS Enforcement

The first line of defense is at the Operating System level. By setting DNS servers directly on every network adapter, we ensure that every request from the computer—regardless of the application—is filtered.

### The Configuration

```powershell
$dnsIpv4 = @("208.67.222.123", "208.67.220.123")
$dnsIpv6 = @("2620:119:35::123", "2620:119:53::123")
Get-NetAdapter | Set-DnsClientServerAddress -ServerAddresses $dnsIpv4
```

### Why OpenDNS (Cisco Umbrella)?

While users can choose any provider, we utilize **OpenDNS FamilyShield** by default.

- **Strictness:** OpenDNS is industry-renowned for its aggressive and accurate categorization of adult content, gambling, and proxy/bypass sites.
- **Reliability:** As part of Cisco Umbrella, it offers world-class uptime and global performance.
- **Zero-Config Blocking:** Unlike standard DNS (like 8.8.8.8), the FamilyShield IPs are pre-configured to block malicious and adult content without requiring a custom account dashboard.

---

## 2. Browser Layer: Locking DNS over HTTPS (DoH)

Modern browsers (Chrome, Edge, Firefox, Brave) often ignore the OS-level DNS settings by using **DNS over HTTPS (DoH)**. This allows the browser to encrypt DNS queries and send them to its own preferred provider (like Cloudflare or Google), effectively bypassing your system's filters.

### The Strategy

We use **Windows Registry Policies** to force the browser's hand. Instead of letting the browser choose, we "Lock" it to a secure provider that matches our system goals.

- **Enforcement:** It switches the DoH mode to `secure` (meaning the browser *must* use DoH and cannot fall back to plain DNS if it fails).
- **Redirection:** It points the `Templates` or `ProviderURL` specifically to OpenDNS: `https://doh.familyshield.opendns.com/dns-query`.
- **UI Lock:** In Firefox, the `Locked` property is set to `1`, which actually greys out the settings in the browser menu, preventing a user from manually changing it.

---

## 3. Search Layer: SafeSearch via Hosts Enforcement

DNS blocking is excellent for blocking entire domains, but it cannot filter the *content* of a search result page or YouTube thumbnails. To prevent "leaks" in search results, we enforce **SafeSearch**.

### The Mechanism

We modify the Windows `hosts` file to perform a "Local Hijack" of search engine domains.

```text
216.239.38.120 www.google.com
216.239.38.120 google.com
216.239.38.120 www.youtube.com
```

- **How it works:** `216.239.38.120` is a special IP address provided by Google (forcesafesearch.google.com). When you point `google.com` to this IP, Google’s servers automatically treat the request as "SafeSearch ON" regardless of the user's account settings.

---

## 4. Network Layer: Outbound Firewall Rules

The final layer prevents bypasses that use direct IP connections or known proxy/VPN ranges that might not rely on DNS.

### The Mechanism

We use **Windows Firewall** to block outbound connections to a curated list of IPs known for providing filter-evasion services.

- **Scope:** This blocks "backdoor" routes that some bypass tools use to tunnel traffic around the DNS and browser-level filters.
- **Reliability:** By blocking at the OS firewall level, we ensure that even if an application ignores DNS and Registry settings, it still cannot reach its destination.

---

## 5. Summary: Why This Works

If you only use one layer, you are vulnerable:

1. **Only OS DNS?** The user can enable DoH in Chrome and bypass it.
2. **Only Browser Extension?** The user can use an Incognito window or a different browser.
3. **Only SafeSearch?** The user can still visit blocked domains directly via their URLs.
4. **Only Firewall?** The firewall cannot block every single domain; it only catches known "backdoors".

**The NoA approach** combines all four:

- **DNS** blocks the "Roads" (Domains).
- **Registry Policies** lock the "Cars" (Browsers) to those roads.
- **Hosts File** ensures that even if you look out the window (Search Results), you only see what is safe.
- **Firewall** blocks "Off-road Bypasses" (Direct IP connections).

This creates a "Maximum Guard" environment where bypassing the filter requires significant technical effort and administrative access.
