document.addEventListener('DOMContentLoaded', function() {
    // Get all DOM elements first
    const textInput = document.getElementById('textInput');
    const saveButton = document.getElementById('saveButton');
    const pasteSaveButton = document.getElementById('pasteSaveButton');
    const searchInput = document.getElementById('searchInput');
    const itemsList = document.getElementById('itemsList');
    const themeToggle = document.getElementById('themeToggle');
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
    const resetSettingsBtn = document.getElementById('resetSettings');
    const decreaseFont = document.getElementById('decreaseFont');
    const increaseFont = document.getElementById('increaseFont');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const clearSearchBtn = document.querySelector('.clear-search');

    let savedItems = [];
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // Initialize settings panel state
    settingsPanel.style.display = 'none';
    clearSearchBtn.style.display = 'none';

    // Load settings immediately
    loadSettings();

    // Set initial theme
    body.setAttribute('data-theme', currentTheme);
    themeToggle.checked = currentTheme === 'light';

    // Theme toggle functionality
    themeToggle.addEventListener('change', function() {
        currentTheme = this.checked ? 'light' : 'dark';
        body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
    });

    // Load saved items from storage
    chrome.storage.local.get(['savedItems'], function(result) {
        savedItems = result.savedItems || [];
        renderItems();
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

    // Save new item
    saveButton.addEventListener('click', function() {
        saveItem();
    });

    // Function to save item
    function saveItem() {
        const text = textInput.value.trim();
        if (text) {
            const newItem = {
                id: Date.now(),
                text: text,
                timestamp: new Date().toISOString()
            };
            savedItems.unshift(newItem);
            chrome.storage.local.set({ savedItems: savedItems }, function() {
                renderItems();
                textInput.value = '';
            });
        }
    }

    // Paste and Save functionality
    pasteSaveButton.addEventListener('click', async function() {
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (clipboardText.trim()) {
                textInput.value = clipboardText;
                saveButton.click();
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        renderItems();
    });

    // Default settings
    const defaultSettings = {
        showCopyBtn: true,
        showDeleteBtn: true,
        showExpandBtn: true,
        showSaveBtn: true,
        showPasteSaveBtn: true,
        showSearch: true,
        enterToSave: true,
        doubleClickEdit: true
    };

    // Validate and apply settings
    function validateAndApplySettings(settings) {
        // If no settings exist, use defaults
        if (!settings || Object.keys(settings).length === 0) {
            settings = defaultSettings;
        }

        // Validate each setting
        const validatedSettings = {};
        for (const [key, value] of Object.entries(settings)) {
            // Ensure the setting exists in defaults
            if (key in defaultSettings) {
                // Ensure the value is a boolean
                validatedSettings[key] = typeof value === 'boolean' ? value : defaultSettings[key];
            }
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

        // Update UI based on validated settings
        updateButtonVisibility();
        renderItems();

        // Return validated settings for storage
        return validatedSettings;
    }

    // Load settings with validation
    function loadSettings() {
        chrome.storage.local.get(['buttonSettings'], function(result) {
            // If no settings exist, initialize with defaults
            if (!result.buttonSettings) {
                chrome.storage.local.set({ buttonSettings: defaultSettings }, function() {
                    validateAndApplySettings(defaultSettings);
                });
            } else {
                validateAndApplySettings(result.buttonSettings);
            }
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
            doubleClickEdit: doubleClickEdit.checked
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
    });

    doubleClickEdit.addEventListener('change', function() {
        saveSettings();
        renderItems();
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

        // Validate and update save button
        if (saveButton && showSaveBtn && showSaveBtn.checked) {
            saveButton.style.display = 'flex';
        } else if (saveButton) {
            saveButton.style.display = 'none';
        }

        // Validate and update paste save button
        if (pasteSaveButton && showPasteSaveBtn && showPasteSaveBtn.checked) {
            pasteSaveButton.style.display = 'flex';
        } else if (pasteSaveButton) {
            pasteSaveButton.style.display = 'none';
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
            contentElement.textContent = item.text;
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';
            
            // Add expand button if enabled and text is long enough
            if (showExpandBtn.checked && item.text.length > 100) {
                const expandButton = document.createElement('button');
                expandButton.className = 'expand-btn';
                expandButton.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>';
                expandButton.title = 'Expand/Collapse';
                expandButton.style.display = 'flex';
                
                expandButton.addEventListener('click', function(e) {
                    e.stopPropagation();
                    contentElement.classList.toggle('expanded');
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
                    savedItems = savedItems.filter(i => i.id !== item.id);
                    chrome.storage.local.set({ savedItems: savedItems }, function() {
                        renderItems();
                    });
                });
            }
            
            itemElement.appendChild(contentElement);
            itemElement.appendChild(buttonContainer);
            
            if (doubleClickEdit.checked) {
                contentElement.addEventListener('dblclick', function() {
                    const textarea = document.createElement('textarea');
                    textarea.value = item.text;
                    textarea.className = 'edit-textarea';
                    textarea.style.width = '100%';
                    textarea.style.height = contentElement.offsetHeight + 'px';
                    
                    contentElement.replaceWith(textarea);
                    textarea.focus();
                    
                    function saveEdit() {
                        const newText = textarea.value.trim();
                        if (newText && newText !== item.text) {
                            item.text = newText;
                            chrome.storage.local.set({ savedItems: savedItems }, function() {
                                renderItems();
                            });
                        } else {
                            renderItems();
                        }
                    }
                    
                    textarea.addEventListener('blur', saveEdit);
                    textarea.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            saveEdit();
                        }
                    });
                });
            }
            
            itemsList.appendChild(itemElement);
        });
    }
}); 