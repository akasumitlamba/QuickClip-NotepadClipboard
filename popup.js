document.addEventListener('DOMContentLoaded', function() {
    const defaultSettings = {
        showCopyBtn: true,
        showDeleteBtn: true,
        showExpandBtn: true,
        showSaveBtn: true,
        showPasteSaveBtn: true,
        showSearch: true,
        enterToSave: true,
        doubleClickEdit: true,
        showRecoverBtn: true,
        showSaveNotifications: true
    };

    // Get all DOM elements first
    const textInput = document.getElementById('textInput');
    const saveButton = document.getElementById('saveButton');
    const pasteSaveButton = document.getElementById('pasteSaveButton');
    const searchInput = document.getElementById('searchInput');
    const itemsList = document.getElementById('itemsList');
    const themeDarkBtn = document.getElementById('themeDarkBtn');
    const themeLightBtn = document.getElementById('themeLightBtn');
    const body = document.body;
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.querySelector('.settings-panel');
    const showCopyBtn = document.getElementById('showCopyBtn');
    const showDeleteBtn = document.getElementById('showDeleteBtn');
    const showExpandBtn = document.getElementById('showExpandBtn');
    const showSaveBtn = document.getElementById('showSaveBtn');
    const showPasteSaveBtn = document.getElementById('showPasteSaveBtn');
    const showSearch = document.getElementById('showSearch');
    const enterToSave = document.getElementById('enterToSave');
    const doubleClickEdit = document.getElementById('doubleClickEdit');
    const showRecoverBtn = document.getElementById('showRecoverBtn');
    const showSaveNotifications = document.getElementById('showSaveNotifications');
    const resetSettingsBtn = document.getElementById('resetSettings');
    const decreaseFont = document.getElementById('decreaseFont');
    const increaseFont = document.getElementById('increaseFont');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const clearSearchBtn = document.querySelector('.clear-search');
    const creditLink = document.getElementById('creditLink');
    const charCount = document.getElementById('charCount');

    let savedItems = [];
    let deletedItems = [];
    let undoTimeout = null;
    let isRecovering = false;
    let hasRecovered = false;
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // Cycle footer messages
    if (creditLink) {
        const footerMessages = [
            {
                text: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> Made by @akasumitlamba',
                url: 'https://www.linkedin.com/in/akasumitlamba/'
            },
            {
                text: '<svg class="icon" viewBox="0 0 24 24"><path d="M22 6h-4.18A3.001 3.001 0 0 0 12.5 3c-.11 0-.22.01-.32.03C11.54 2.38 10.82 2 10 2a3.001 3.001 0 0 0-3 3c0 .28.04.55.11.81A2.99 2.99 0 0 0 2 6v3h20V6zM10 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4.5 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM2 11v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8H2zm9 8H4v-6h7v6zm9 0h-7v-6h7v6z"/></svg> Get QuickClip Pro (Free)',
                url: 'https://chromewebstore.google.com/detail/ndibnfgbmcfgoeapohknfeeiilgfhdjg?utm_source=item-share-cb'
            },
            {
                text: '<svg class="icon" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/></svg> Rate us 5 stars',
                url: 'https://microsoftedge.microsoft.com/addons/detail/icffibdmcbmfnpbjeojmlpechnebmoni'
            },
            {
                text: '<svg class="icon" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg> Share QuickClip',
                url: 'https://microsoftedge.microsoft.com/addons/detail/icffibdmcbmfnpbjeojmlpechnebmoni'
            }
        ];
        
        let messageIndex = parseInt(localStorage.getItem('footerMessageIndex') || '0', 10);
        
        // Ensure index is within bounds (in case we add/remove messages later)
        if (isNaN(messageIndex) || messageIndex >= footerMessages.length) {
            messageIndex = 0;
        }
        
        const currentMessage = footerMessages[messageIndex];
        creditLink.innerHTML = currentMessage.text;
        creditLink.href = currentMessage.url;
        
        // Save the next index for the next open
        localStorage.setItem('footerMessageIndex', ((messageIndex + 1) % footerMessages.length).toString());
    }

    // Initialize settings panel state
    settingsPanel.style.display = 'none';
    clearSearchBtn.style.display = 'none';

    // Load settings immediately
    loadSettings();

    // Set initial theme
    body.setAttribute('data-theme', currentTheme);
    updateThemeButtons();

    // Theme toggle functionality
    themeDarkBtn.addEventListener('click', function() {
        if (currentTheme !== 'dark') {
            currentTheme = 'dark';
            body.setAttribute('data-theme', currentTheme);
            localStorage.setItem('theme', currentTheme);
            updateThemeButtons();
        }
    });

    themeLightBtn.addEventListener('click', function() {
        if (currentTheme !== 'light') {
            currentTheme = 'light';
            body.setAttribute('data-theme', currentTheme);
            localStorage.setItem('theme', currentTheme);
            updateThemeButtons();
        }
    });

    function updateThemeButtons() {
        const isLightTheme = currentTheme === 'light';
        themeDarkBtn.classList.toggle('active', !isLightTheme);
        themeLightBtn.classList.toggle('active', isLightTheme);
        themeDarkBtn.setAttribute('aria-pressed', String(!isLightTheme));
        themeLightBtn.setAttribute('aria-pressed', String(isLightTheme));
    }

    // Load saved items from storage
    chrome.storage.local.get(['savedItems'], function(result) {
        savedItems = result.savedItems || [];
        renderItems();
    });

    chrome.storage.onChanged.addListener(function(changes, areaName) {
        if (areaName === 'local' && changes.savedItems) {
            savedItems = changes.savedItems.newValue || [];
            if (!document.querySelector('.edit-textarea:focus')) {
                renderItems();
            }
        }
    });

    // Handle Shift+Enter for new lines and Enter to save
    textInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                // Allow new line
                return;
            } else if (enterToSave.checked) {
                // Prevent default and save
                e.preventDefault();
                saveItem();
            }
        }
    });

    // Handle character counter
    textInput.addEventListener('input', function() {
        if (charCount) charCount.textContent = textInput.value.length;
    });

    // Save new item
    saveButton.addEventListener('click', function() {
        saveItem();
    });

    // Render text with clickable URLs safely avoiding XSS
    function renderContentWithUrls(text, container) {
        container.innerHTML = '';
        const urlRegex = /(?:https?:\/\/|www\.)[^\s<]+[^<.,:;"')\]\s]/g;
        
        let lastIndex = 0;
        let match;
        
        while ((match = urlRegex.exec(text)) !== null) {
            // Add text before the URL
            if (match.index > lastIndex) {
                container.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }
            
            // Add the URL as an anchor tag
            const url = match[0];
            const a = document.createElement('a');
            const fullUrl = url.startsWith('www.') ? 'https://' + url : url;
            a.href = fullUrl;
            a.className = 'hyperlink';
            a.target = '_blank';
            a.textContent = url;
            container.appendChild(a);
            
            lastIndex = urlRegex.lastIndex;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
            container.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
    }

    // Function to save item
    function saveItem() {
        const text = textInput.value.trim();
        if (text) {
            const newItem = {
                id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
                text: text,
                timestamp: new Date().toISOString()
            };
            chrome.storage.local.get(['savedItems'], function(result) {
                const currentItems = result.savedItems || [];
                currentItems.unshift(newItem);
                chrome.storage.local.set({ savedItems: currentItems }, function() {
                    // renderItems will be called by onChanged if not editing
                    if (!document.querySelector('.edit-textarea:focus')) renderItems();
                    textInput.value = '';
                    if (charCount) charCount.textContent = '0';
                });
            });
        }
    }

    // Paste and Save functionality
    pasteSaveButton.addEventListener('click', async function() {
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (clipboardText.trim()) {
                const newItem = {
                    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
                    text: clipboardText,
                    timestamp: new Date().toISOString()
                };
                chrome.storage.local.get(['savedItems'], function(result) {
                    const currentItems = result.savedItems || [];
                    currentItems.unshift(newItem);
                    chrome.storage.local.set({ savedItems: currentItems }, function() {
                        if (!document.querySelector('.edit-textarea:focus')) renderItems();
                    });
                });
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        renderItems();
    });

    // Validate and apply settings
    function validateAndApplySettings(settings) {
        const validatedSettings = {};
        const sourceSettings = settings && typeof settings === 'object' ? settings : {};

        // Always populate every known setting so missing keys inherit defaults.
        for (const [key, defaultValue] of Object.entries(defaultSettings)) {
            const value = sourceSettings[key];
            validatedSettings[key] = typeof value === 'boolean' ? value : defaultValue;
        }

        // Apply validated settings to checkboxes
        if (validatedSettings.showCopyBtn !== undefined) {
            showCopyBtn.checked = validatedSettings.showCopyBtn;
        }
        if (validatedSettings.showDeleteBtn !== undefined) {
            showDeleteBtn.checked = validatedSettings.showDeleteBtn;
        }
        if (validatedSettings.showExpandBtn !== undefined) {
            showExpandBtn.checked = validatedSettings.showExpandBtn;
        }
        if (validatedSettings.showSaveBtn !== undefined) {
            showSaveBtn.checked = validatedSettings.showSaveBtn;
        }
        if (validatedSettings.showPasteSaveBtn !== undefined) {
            showPasteSaveBtn.checked = validatedSettings.showPasteSaveBtn;
        }
        if (validatedSettings.showSearch !== undefined) {
            showSearch.checked = validatedSettings.showSearch;
        }
        if (validatedSettings.enterToSave !== undefined) {
            enterToSave.checked = validatedSettings.enterToSave;
        }
        if (validatedSettings.doubleClickEdit !== undefined) {
            doubleClickEdit.checked = validatedSettings.doubleClickEdit;
        }
        if (validatedSettings.showRecoverBtn !== undefined) {
            showRecoverBtn.checked = validatedSettings.showRecoverBtn;
        }
        if (validatedSettings.showSaveNotifications !== undefined) {
            showSaveNotifications.checked = validatedSettings.showSaveNotifications;
        }

        // Update UI based on validated settings
        updateButtonVisibility();
        renderItems();

        // Return validated settings for storage
        return validatedSettings;
    }

    // Function to update placeholder text
    function updatePlaceholderText() {
        textInput.placeholder = "Enter text here...";
    }

    // Load settings with validation
    function loadSettings() {
        chrome.storage.local.get(['buttonSettings'], function(result) {
            const validatedSettings = validateAndApplySettings(result.buttonSettings);
            chrome.storage.local.set({ buttonSettings: validatedSettings }, function() {
                updatePlaceholderText();
            });
        });
    }

    // Save settings with validation
    function saveSettings() {
        const settings = {
            showCopyBtn: showCopyBtn.checked,
            showDeleteBtn: showDeleteBtn.checked,
            showExpandBtn: showExpandBtn.checked,
            showSaveBtn: showSaveBtn.checked,
            showPasteSaveBtn: showPasteSaveBtn.checked,
            showSearch: showSearch.checked,
            enterToSave: enterToSave.checked,
            doubleClickEdit: doubleClickEdit.checked,
            showRecoverBtn: showRecoverBtn.checked,
            showSaveNotifications: showSaveNotifications.checked
        };

        const validatedSettings = validateAndApplySettings(settings);
        chrome.storage.local.set({ buttonSettings: validatedSettings });
    }

    // Add event listeners for all settings changes
    showCopyBtn.addEventListener('change', function() {
        saveSettings();
        updateButtonVisibility();
    });

    showDeleteBtn.addEventListener('change', function() {
        saveSettings();
        updateButtonVisibility();
    });

    showExpandBtn.addEventListener('change', function() {
        saveSettings();
        updateButtonVisibility();
    });

    showSaveBtn.addEventListener('change', function() {
        saveSettings();
        updateButtonVisibility();
    });

    showPasteSaveBtn.addEventListener('change', function() {
        saveSettings();
        updateButtonVisibility();
    });

    showSearch.addEventListener('change', function() {
        saveSettings();
        updateButtonVisibility();
        if (!showSearch.checked) {
            searchInput.value = '';
            renderItems();
        }
    });

    enterToSave.addEventListener('change', function() {
        saveSettings();
        updatePlaceholderText();
    });

    doubleClickEdit.addEventListener('change', function() {
        saveSettings();
        renderItems();
    });

    // Add event listener for recover button setting change
    showRecoverBtn.addEventListener('change', function() {
        saveSettings();
        const recoverButton = document.getElementById('undoButton');
        if (!showRecoverBtn.checked) {
            // Hide button and clear state immediately if turned off
            recoverButton.style.display = 'none';
            deletedItems = []; 
            preDeletionSavedItems = null;
            if (undoTimeout) {
                clearTimeout(undoTimeout);
                undoTimeout = null;
            }
            hasRecovered = false; // Reset recovery flag if toggled off
        } else {
            // If turned on, check if there's a pending recovery state
            if (deletedItems.length > 0 && !hasRecovered) {
                recoverButton.style.display = 'flex';
                // Optionally restart timeout? Better to let next delete handle it.
            } else {
                recoverButton.style.display = 'none'; // Keep hidden if no pending recovery
            }
        }
    });

    showSaveNotifications.addEventListener('change', function() {
        saveSettings();
    });

    // Toggle settings panel
    settingsBtn.addEventListener('click', function() {
        const isHidden = !settingsPanel.classList.contains('active');
        if (isHidden) {
            settingsPanel.style.display = 'block';
            // Force a reflow to ensure the animation works
            void settingsPanel.offsetWidth;
            settingsPanel.classList.add('active');
        } else {
            settingsPanel.classList.remove('active');
            // Wait for animation to complete before hiding
            setTimeout(() => {
                if (!settingsPanel.classList.contains('active')) {
                    settingsPanel.style.display = 'none';
                }
            }, 300);
        }
    });

    // Show/hide clear button based on search input
    searchInput.addEventListener('input', function() {
        clearSearchBtn.style.display = this.value ? 'flex' : 'none';
        renderItems();
    });

    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchInput.focus();
        clearSearchBtn.style.display = 'none';
        renderItems();
    });

    // Font size functionality
    const minFontSize = 12;
    const maxFontSize = 20;
    const defaultFontSize = 14;

    // Load saved font size
    chrome.storage.local.get(['fontSize'], function(result) {
        const fontSize = result.fontSize || defaultFontSize;
        updateFontSize(fontSize);
    });

    decreaseFont.addEventListener('click', function() {
        const currentSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
        if (currentSize > minFontSize) {
            updateFontSize(currentSize - 1);
        }
    });

    increaseFont.addEventListener('click', function() {
        const currentSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--font-size'));
        if (currentSize < maxFontSize) {
            updateFontSize(currentSize + 1);
        }
    });

    function updateFontSize(size) {
        // Update the root CSS variable
        document.documentElement.style.setProperty('--font-size', size + 'px');
        
        // Update the display value
        fontSizeValue.textContent = size + 'px';
        
        // Save the new size
        chrome.storage.local.set({ fontSize: size });
        
        // Force a re-render of all items to apply the new font size
        const items = document.querySelectorAll('.saved-item-content');
        items.forEach(item => {
            item.style.fontSize = size + 'px';
        });
        
        // Update all inputs and textareas
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.style.fontSize = size + 'px';
        });
        
        // Update all buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.fontSize = size + 'px';
        });
    }

    // Reset settings with validation
    resetSettingsBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            const validatedSettings = validateAndApplySettings(defaultSettings);
            
            // Reset font size
            updateFontSize(defaultFontSize);
            
            // Save all settings
            chrome.storage.local.set({ 
                buttonSettings: validatedSettings,
                fontSize: defaultFontSize
            }, function() {
                // Double-check settings after save
                loadSettings();
            });
        }
    });

    // Update button visibility with validation
    function updateButtonVisibility() {
        const copyButtons = document.querySelectorAll('.copy-btn');
        const deleteButtons = document.querySelectorAll('.delete-btn');
        const expandButtons = document.querySelectorAll('.expand-btn');
        const saveButton = document.getElementById('saveButton');
        const pasteSaveButton = document.getElementById('pasteSaveButton');
        const searchSection = document.querySelector('.search-section');

        // Validate and update copy buttons
        if (showCopyBtn && showCopyBtn.checked) {
            copyButtons.forEach(btn => {
                if (btn) btn.style.display = 'flex';
            });
        } else {
            copyButtons.forEach(btn => {
                if (btn) btn.style.display = 'none';
            });
        }

        // Validate and update delete buttons
        if (showDeleteBtn && showDeleteBtn.checked) {
            deleteButtons.forEach(btn => {
                if (btn) btn.style.display = 'flex';
            });
        } else {
            deleteButtons.forEach(btn => {
                if (btn) btn.style.display = 'none';
            });
        }

        // Validate and update expand buttons
        if (showExpandBtn && showExpandBtn.checked) {
            expandButtons.forEach(btn => {
                if (btn) btn.style.display = 'flex';
            });
        } else {
            expandButtons.forEach(btn => {
                if (btn) btn.style.display = 'none';
            });
        }

        // Validate and update save button and text input area
        const textInputEl = document.getElementById('textInput');
        
        if (showSaveBtn && showSaveBtn.checked) {
            if (saveButton) saveButton.style.display = '';
            if (textInputEl) textInputEl.style.display = '';
        } else {
            if (saveButton) saveButton.style.display = 'none';
            if (textInputEl) textInputEl.style.display = 'none';
        }

        // Validate and update paste save button
        if (pasteSaveButton && showPasteSaveBtn && showPasteSaveBtn.checked) {
            pasteSaveButton.style.display = 'flex';
        } else if (pasteSaveButton) {
            pasteSaveButton.style.display = 'none';
        }

        // Collapse input section entirely if both are off
        const inputSection = document.querySelector('.input-section');
        if (inputSection) {
            if ((!showSaveBtn || !showSaveBtn.checked) && (!showPasteSaveBtn || !showPasteSaveBtn.checked)) {
                inputSection.style.display = 'none';
            } else {
                inputSection.style.display = 'flex';
            }
        }

        // Validate and update search section
        if (searchSection && showSearch) {
            searchSection.style.display = showSearch.checked ? 'block' : 'none';
        }
    }

    // Render items list
    function renderItems() {
        itemsList.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase();
        
        const filteredItems = savedItems.filter(item => 
            item.text.toLowerCase().includes(searchTerm)
        );

        filteredItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'saved-item';
            
            const contentElement = document.createElement('div');
            contentElement.className = 'saved-item-content';
            
            // Render text safely avoiding XSS, converting URLs
            renderContentWithUrls(item.text, contentElement);
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';
            
            const shouldShowExpandButton = item.text.length > 100 || item.text.split('\n').length > 2;

            // Add expand button if enabled and content is long enough
            if (showExpandBtn.checked && shouldShowExpandButton) {
                const expandButton = document.createElement('button');
                expandButton.className = 'expand-btn';
                expandButton.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>';
                expandButton.title = 'Expand/Collapse';
                expandButton.style.display = 'flex';
                
                expandButton.addEventListener('click', function(e) {
                    e.stopPropagation();
                    contentElement.classList.toggle('expanded');
                    itemElement.classList.toggle('is-expanded', contentElement.classList.contains('expanded'));
                    expandButton.innerHTML = contentElement.classList.contains('expanded') 
                        ? '<svg class="icon" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>'
                        : '<svg class="icon" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>';
                });
                
                buttonContainer.appendChild(expandButton);
            }
            
            // Add copy button if enabled
            if (showCopyBtn.checked) {
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-btn';
                copyButton.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
                copyButton.title = 'Copy';
                copyButton.style.display = 'flex';
                buttonContainer.appendChild(copyButton);

                copyButton.addEventListener('click', function(e) {
                    e.stopPropagation();
                    navigator.clipboard.writeText(item.text).then(() => {
                        const originalIcon = copyButton.innerHTML;
                        copyButton.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';
                        setTimeout(() => {
                            copyButton.innerHTML = originalIcon;
                        }, 2000);
                    });
                });
            }
            
            // Add delete button if enabled
            if (showDeleteBtn.checked) {
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
                deleteButton.title = 'Delete';
                deleteButton.style.display = 'flex';
                buttonContainer.appendChild(deleteButton);

                deleteButton.addEventListener('click', function(e) {
                    e.stopPropagation();
                    
                    // If this is the first delete since the last recovery or page load, reset the state
                    if (deletedItems.length === 0) {
                        hasRecovered = false;
                        if (undoTimeout) {
                            clearTimeout(undoTimeout);
                            undoTimeout = null;
                        }
                    }
                    
                    // Store the full item for proper recovery
                    deletedItems.push(item);
                    
                    chrome.storage.local.get(['savedItems'], function(result) {
                        let currentItems = result.savedItems || [];
                        currentItems = currentItems.filter(i => i.id !== item.id);
                        
                        chrome.storage.local.set({ savedItems: currentItems }, function() {
                            if (!document.querySelector('.edit-textarea:focus')) renderItems();
                            // Show recover button ONLY if setting is enabled and it hasn't been used yet
                            const recoverButton = document.getElementById('undoButton');
                            if (showRecoverBtn.checked && !hasRecovered) {
                                recoverButton.style.display = 'flex';
                            } else {
                                // Explicitly hide if setting is off or already recovered
                                recoverButton.style.display = 'none';
                            }
                            
                            // Always reset the timeout on each deletion within the sequence
                            if (undoTimeout) {
                                clearTimeout(undoTimeout);
                            }
                            // Set timeout to hide recover button after 10 seconds, only if setting is enabled
                            if (showRecoverBtn.checked) {
                                undoTimeout = setTimeout(() => {
                                    // Check again if setting is still enabled and recovery hasn't happened
                                    if (showRecoverBtn.checked && !hasRecovered) {
                                        recoverButton.style.display = 'none';
                                        deletedItems = []; // Clear deleted items if timeout expires before recovery
                                    } 
                                    // If setting was turned off or recovery happened during timeout, do nothing here
                                }, 10000);
                            }
                        });
                    });
                });
            }
            
            itemElement.appendChild(buttonContainer);
            itemElement.appendChild(contentElement);
            
            // Handle hyperlink clicks and double-clicks
            if (doubleClickEdit.checked) {
                let clickTimer;
                
                // Add click handler to the content element
                contentElement.addEventListener('click', function(e) {
                    // Don't handle clicks on buttons
                    if (e.target.closest('.button-container')) {
                        return;
                    }

                    const link = e.target.closest('a');
                    if (link) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (e.detail === 1) { // Single click
                            clickTimer = setTimeout(() => {
                                if (!this.classList.contains('editing')) {
                                    chrome.tabs.create({ url: link.href });
                                }
                            }, 250);
                        }
                    }
                });

                // Add double-click handler for the entire content
                contentElement.addEventListener('dblclick', function(e) {
                    // Don't handle double-clicks on buttons
                    if (e.target.closest('.button-container')) {
                        return;
                    }

                    // If clicking on a link, prevent default behavior
                    const link = e.target.closest('a');
                    if (link) {
                        e.preventDefault();
                        e.stopPropagation();
                        clearTimeout(clickTimer);
                    }
                    
                    // Hide action buttons during edit
                    buttonContainer.style.display = 'none';

                    const textarea = document.createElement('textarea');
                    textarea.value = item.text;
                    textarea.className = 'edit-textarea';
                    textarea.style.width = '100%';
                    
                    // Set initial height based on content
                    const lineHeight = parseInt(getComputedStyle(contentElement).lineHeight);
                    const lines = item.text.split('\n').length;
                    const initialHeight = Math.min(Math.max(lines * lineHeight, 60), 400);
                    textarea.style.height = initialHeight + 'px';
                    
                    contentElement.replaceWith(textarea);
                    textarea.focus();
                    
                    // Place cursor at the end of the text
                    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
                    
                    function saveEdit() {
                        const newText = textarea.value.trim();
                        if (newText && newText !== item.text) {
                            chrome.storage.local.get(['savedItems'], function(result) {
                                let currentItems = result.savedItems || [];
                                const itemIndex = currentItems.findIndex(i => i.id === item.id);
                                if (itemIndex !== -1) {
                                    currentItems[itemIndex].text = newText;
                                    chrome.storage.local.set({ savedItems: currentItems }, function() {
                                        // The onChanged listener will call renderItems correctly
                                        // but if not, we can force it here:
                                        if (!document.querySelector('.edit-textarea:focus')) renderItems();
                                    });
                                } else {
                                    renderItems();
                                }
                            });
                        } else {
                            renderItems();
                        }
                        // Restore action buttons just in case renderItems doesn't fully replace DOM immediately
                        buttonContainer.style.display = 'flex';
                    }
                    
                    textarea.addEventListener('blur', saveEdit);
                    textarea.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            textarea.blur(); // Trigger blur to save edit
                        }
                    });
                });
            } else {
                // When double-click editing is off, only handle link clicks
                contentElement.addEventListener('click', function(e) {
                    const link = e.target.closest('a');
                    if (link) {
                        e.preventDefault();
                        e.stopPropagation();
                        chrome.tabs.create({ url: link.href });
                    }
                });
            }
            
            itemsList.appendChild(itemElement);
        });
    }

    // Add recover button functionality
    document.getElementById('undoButton').addEventListener('click', function() {
        const recoverButton = this;
        // Double-check setting before allowing recovery
        if (showRecoverBtn.checked && deletedItems.length > 0 && !isRecovering && !hasRecovered) {
            isRecovering = true;
            
            if (undoTimeout) {
                clearTimeout(undoTimeout);
                undoTimeout = null;
            }

            chrome.storage.local.get(['savedItems'], function(result) {
                let currentItems = result.savedItems || [];
                
                // Add deleted items back, avoiding any duplicates just in case
                const currentIds = new Set(currentItems.map(item => item.id));
                const itemsToRestore = deletedItems.filter(item => !currentIds.has(item.id));
                
                currentItems = [...currentItems, ...itemsToRestore];
                currentItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                chrome.storage.local.set({ savedItems: currentItems }, function() {
                    if (!document.querySelector('.edit-textarea:focus')) renderItems();
                    
                    recoverButton.style.display = 'none'; // Always hide after recovery
                    deletedItems = [];
                    isRecovering = false;
                    hasRecovered = true; 
                });
            });
        }
    });
}); 
