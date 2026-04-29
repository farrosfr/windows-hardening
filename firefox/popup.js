document.addEventListener('DOMContentLoaded', () => {
    const keywordsInput = document.getElementById('keywords');
    const domainsInput = document.getElementById('domains');
    const redirectInput = document.getElementById('redirect');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');

    // Lock elements
    const lockToggleBtn = document.getElementById('lockToggleBtn');
    const unlockArea = document.getElementById('unlockArea');
    const challengeStrEl = document.getElementById('challengeStr');
    const unlockInput = document.getElementById('unlockInput');
    const guideBtn = document.getElementById('guideBtn');

    let isLocked = false;
    let currentChallenge = '';

    // Generates a random 15-character string (removed confusing characters like 1, I, l, 0, O)
    function generateChallenge() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < 15; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Updates the visual state of the dashboard
    function updateUI() {
        keywordsInput.disabled = isLocked;
        domainsInput.disabled = isLocked;
        redirectInput.disabled = isLocked;
        saveBtn.disabled = isLocked;

        if (isLocked) {
            lockToggleBtn.textContent = 'Verify & Unlock';
            lockToggleBtn.classList.add('unlock-mode');
            unlockArea.style.display = 'block';
            
            // Generate a new challenge only if we don't have one actively displayed
            if (!currentChallenge) currentChallenge = generateChallenge();
            challengeStrEl.textContent = currentChallenge;
            unlockInput.value = ''; 
        } else {
            lockToggleBtn.textContent = 'Lock Settings';
            lockToggleBtn.classList.remove('unlock-mode');
            unlockArea.style.display = 'none';
            currentChallenge = '';
        }
    }

    // Open Guide
    guideBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'guide.html' });
    });

    // Initialize: Load all settings including the lock state
    chrome.storage.local.get(['blockedKeywords', 'excludedDomains', 'redirectUrl', 'isLocked'], (data) => {
        keywordsInput.value = data.blockedKeywords || 'lk21, indoxxi, film semi, dramacool, vivamax, pinoy cinema';
        domainsInput.value = data.excludedDomains || 'farrosfr.com, google.com, medium.com';
        redirectInput.value = data.redirectUrl || 'https://www.youtube.com/watch?v=fbTlW1V2VuI';
        isLocked = data.isLocked || false;
        updateUI();
    });

    // Save Settings
    saveBtn.addEventListener('click', () => {
        chrome.storage.local.set({
            blockedKeywords: keywordsInput.value,
            excludedDomains: domainsInput.value,
            redirectUrl: redirectInput.value
        }, () => {
            status.style.display = 'block';
            setTimeout(() => status.style.display = 'none', 2000);
        });
    });

    // Lock / Unlock Logic
    lockToggleBtn.addEventListener('click', () => {
        if (!isLocked) {
            // Lock it down
            isLocked = true;
            chrome.storage.local.set({ isLocked: true }, updateUI);
        } else {
            // Attempt to unlock
            if (unlockInput.value === currentChallenge) {
                isLocked = false;
                chrome.storage.local.set({ isLocked: false }, updateUI);
            } else {
                // Wrong input, shake the input box or alert
                alert("Incorrect text! Please type the exact sequence to unlock.");
                unlockInput.value = '';
            }
        }
    });
    
    // Prevent pasting into the unlock field via JS
    unlockInput.onpaste = e => e.preventDefault();
});