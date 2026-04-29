(function() {
    'use strict';

    if (window.top !== window.self) return; // Prevent execution in hidden ad iframes

    // Fetch the dynamic rules from the extension dashboard
    chrome.storage.local.get(['blockedKeywords', 'excludedDomains', 'redirectUrl'], (data) => {
        const rawKeywords = data.blockedKeywords || 'lk21, indoxxi, film semi, dramacool, vivamax, pinoy cinema';
        const rawDomains = data.excludedDomains || 'farrosfr.com, google.com, medium.com';
        const targetURL = data.redirectUrl || 'https://www.youtube.com/watch?v=fbTlW1V2VuI';

        // 1. Process Exclusions
        const excludedDomains = rawDomains.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
        const currentHost = window.location.hostname.toLowerCase();
        
        const isExcluded = excludedDomains.some(domain =>
            currentHost === domain || currentHost.endsWith('.' + domain)
        );

        if (isExcluded) return; // Exit immediately if on a safe list

        // 2. Process Keywords safely
        const keywordArray = rawKeywords.split(',').map(k => k.trim()).filter(Boolean);
        if (keywordArray.length === 0) return;

        // Escape any accidental regex characters the user types in the dashboard, then build the active pattern
        const escapedKeywords = keywordArray.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const badKeywords = new RegExp(escapedKeywords.join('|'), 'i');

        // 3. Execution Function
        function enforceRedirect() {
            window.stop();
            document.documentElement.innerHTML = '<h1 style="text-align:center; margin-top:20%; font-family:sans-serif; color:#333;">Redirecting...</h1>';
            window.location.replace(targetURL);
        }

        // 4. Immediate URL check
        if (badKeywords.test(window.location.href)) {
            enforceRedirect();
            return;
        }

        // 5. Surveillance
        const observer = new MutationObserver((mutations, obs) => {
            if (document.title && badKeywords.test(document.title)) {
                obs.disconnect();
                enforceRedirect();
            }
            if (document.body && badKeywords.test(document.body.textContent)) {
                obs.disconnect();
                enforceRedirect();
            }
        });

        observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    });
})();