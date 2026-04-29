# NoA Blocker & Windows Hardening Suite

A multi-layer content filtering and system hardening solution designed for high-performance blocking and un-bypassable enforcement. Developed by **Farros FR** ([farrosfr.com](https://farrosfr.com)).

## Project Overview

This suite provides a "defense-in-depth" approach to content filtering, tackling the problem at both the Operating System and Browser levels.

### 1. OS-Level Hardening (`harden.ps1`)

The PowerShell script applies deep system changes to prevent filtering bypasses at the network level:

- **System-wide DNS Enforcement:** Forces OpenDNS FamilyShield on all network adapters (IPv4 and IPv6).
- **DNS over HTTPS (DoH) Lock:** Uses Registry Policies to force secure DoH templates for Chrome, Edge, Firefox, and Brave, preventing users from switching to unfiltered DNS within the browser.
- **SafeSearch Enforcement:** Modifies the system `hosts` file to force Google, YouTube, Bing, and DuckDuckGo into SafeSearch mode.
- **Firewall Evasion Blocking:** Implements outbound firewall rules to block known IP ranges used for content filtering bypasses.

### 2. Browser-Level Protection (Extensions)

Available for both **Chrome** and **Firefox**, these extensions provide real-time content inspection and redirection:

- **Keyword Filtering:** Automatically detects and blocks access to sites based on custom keywords (e.g., piracy, adult content).
- **Domain Whitelisting:** Easily exclude trusted domains like `farrosfr.com` or `google.com`.
- **Dynamic Redirection:** Redirects blocked attempts to a specified educational or neutral URL.
- **Settings Lock (Firefox):** Features a "Challenge-Response" lock mechanism. To modify settings, the user must manually type a randomized 15-character string, preventing impulsive changes to the filter.

## Installation

### Windows Hardening

1. Open PowerShell as **Administrator**.
2. Navigate to the project directory.
3. Run the script:

   ```powershell
   .\harden.ps1
   ```

4. Restart your browser for changes to take effect.

### Browser Extensions

#### Chrome

1. Go to `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `chrome/` folder.

#### Firefox

1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select the `manifest.json` inside the `firefox/` folder.

## Configuration

The Firefox extension includes a popup dashboard to:

- Update blocked keywords.
- Manage excluded domains.
- Set the redirection target.
- Toggle the **Settings Lock** for strict enforcement.

## Credits

Developed with 💻 by **Farros FR**.

- **Website:** [https://farrosfr.com](https://farrosfr.com)
- **GitHub:** [https://github.com/farrosfr](https://github.com/farrosfr)

---
*Disclaimer: Use this tool responsibly. It is designed for red team operators and system administrators to enforce corporate or personal content policies.*
