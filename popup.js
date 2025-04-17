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

    // Function to check if text is a URL
    function isURL(text) {
        try {
            new URL(text);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Function to save item
    function saveItem() {
        const text = textInput.value.trim();
        if (text) {
            const newItem = {
                id: Date.now(),
                text: text,
                timestamp: new Date().toISOString(),
                isLink: isURL(text)
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
            // First try to read image data
            const clipboardItems = await navigator.clipboard.read();
            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        const blob = await clipboardItem.getType(type);
                        // Convert blob to base64
                        const reader = new FileReader();
                        reader.onload = function() {
                            const base64data = reader.result;
                            const newItem = {
                                id: Date.now(),
                                text: base64data,
                                timestamp: new Date().toISOString(),
                                isImage: true,
                                mimeType: type
                            };
                            savedItems.unshift(newItem);
                            chrome.storage.local.set({ savedItems: savedItems }, function() {
                                renderItems();
                            });
                        };
                        reader.readAsDataURL(blob);
                        return; // Exit after handling the first image
                    }
                }
            }
            
            // If no image found, try to read text
            const clipboardText = await navigator.clipboard.readText();
            if (clipboardText.trim()) {
                textInput.value = clipboardText;
                saveButton.click();
            }
        } catch (err) {
            console.error('Failed to read clipboard:', err);
            // Fallback to text if image reading fails
            try {
                const clipboardText = await navigator.clipboard.readText();
                if (clipboardText.trim()) {
                    textInput.value = clipboardText;
                    saveButton.click();
                }
            } catch (err) {
                console.error('Failed to read clipboard text:', err);
            }
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

    // Function to update placeholder text based on Enter to Save setting
    function updatePlaceholderText() {
        const placeholder = enterToSave.checked 
            ? "Enter text to save... (Enter to save, Shift+Enter for new line)"
            : "Enter text to save... (Shift+Enter for new line)";
        textInput.placeholder = placeholder;
    }

    // Load settings with validation
    function loadSettings() {
        chrome.storage.local.get(['buttonSettings'], function(result) {
            // If no settings exist, initialize with defaults
            if (!result.buttonSettings) {
                chrome.storage.local.set({ buttonSettings: defaultSettings }, function() {
                    validateAndApplySettings(defaultSettings);
                    updatePlaceholderText(); // Update placeholder after loading defaults
                });
            } else {
                validateAndApplySettings(result.buttonSettings);
                updatePlaceholderText(); // Update placeholder after loading settings
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
        updatePlaceholderText();
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

    // Function to edit an item
    function editItem(contentElement, item) {
        // Don't allow editing of images
        if (item.isImage) return;

        const textarea = document.createElement('textarea');
        textarea.value = item.text;
        textarea.className = 'edit-textarea';
        textarea.style.width = '100%';
        
        // Set initial height based on content
        const lineHeight = parseInt(getComputedStyle(contentElement).lineHeight);
        const lines = item.text.split('\n').length;
        const initialHeight = Math.min(Math.max(lines * lineHeight, 60), 400);
        textarea.style.height = initialHeight + 'px';
        
        // Store the parent element reference
        const parentElement = contentElement.parentElement;
        
        // Replace the content element with textarea
        parentElement.replaceChild(textarea, contentElement);
        textarea.focus();
        
        // Place cursor at the end of the text
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        
        function saveEdit() {
            const newText = textarea.value.trim();
            if (newText && newText !== item.text) {
                item.text = newText;
                item.isLink = isURL(newText);
                chrome.storage.local.set({ savedItems: savedItems }, function() {
                    // Use setTimeout to ensure DOM updates happen after the current event loop
                    setTimeout(() => {
                        renderItems();
                    }, 0);
                });
            } else {
                // Use setTimeout to ensure DOM updates happen after the current event loop
                setTimeout(() => {
                    renderItems();
                }, 0);
            }
        }
        
        // Use a flag to prevent multiple saves
        let isSaving = false;
        
        textarea.addEventListener('blur', function() {
            if (!isSaving) {
                isSaving = true;
                saveEdit();
            }
        });
        
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isSaving) {
                    isSaving = true;
                    saveEdit();
                }
            }
        });
    }

    // Create image modal
    const imageModal = document.createElement('div');
    imageModal.className = 'image-modal';
    document.body.appendChild(imageModal);

    // Function to show full-size image
    function showFullSizeImage(src) {
        // Create wrapper for better drag control
        const wrapper = document.createElement('div');
        wrapper.className = 'image-modal-wrapper';
        
        const modalContent = document.createElement('img');
        modalContent.className = 'image-modal-content';
        modalContent.src = src;
        
        // Create zoom controls
        const zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';
        
        const zoomInBtn = document.createElement('button');
        zoomInBtn.className = 'zoom-btn';
        zoomInBtn.title = 'Zoom In (Page Up)';
        zoomInBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" fill="white"/>
            </svg>
        `;
        
        const zoomOutBtn = document.createElement('button');
        zoomOutBtn.className = 'zoom-btn';
        zoomOutBtn.title = 'Zoom Out (Page Down)';
        zoomOutBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z" fill="white"/>
            </svg>
        `;
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.title = 'Close (Esc)';
        closeBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white"/>
            </svg>
        `;
        
        // Create zoom level indicator
        const zoomLevelIndicator = document.createElement('div');
        zoomLevelIndicator.className = 'zoom-level';
        
        // Create navigation indicator
        const navIndicator = document.createElement('div');
        navIndicator.className = 'nav-indicator';
        navIndicator.innerHTML = `
            <div class="key-group arrows">
                <div class="key up">
                    <svg viewBox="0 0 24 24">
                        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                    </svg>
                </div>
                <div class="key left">
                    <svg viewBox="0 0 24 24">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                </div>
                <div class="key down">
                    <svg viewBox="0 0 24 24">
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/>
                    </svg>
                </div>
                <div class="key right">
                    <svg viewBox="0 0 24 24">
                        <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                    </svg>
                </div>
            </div>
            <span class="text">Use arrow keys to navigate</span>
        `;
        
        // Clear previous content and add new elements
        imageModal.innerHTML = '';
        wrapper.appendChild(modalContent);
        imageModal.appendChild(wrapper);
        imageModal.appendChild(zoomControls);
        imageModal.appendChild(closeBtn);
        imageModal.appendChild(zoomLevelIndicator);
        imageModal.appendChild(navIndicator);
        zoomControls.appendChild(zoomInBtn);
        zoomControls.appendChild(zoomOutBtn);
        
        // Show modal
        imageModal.classList.add('active');
        
        // Add zoom functionality
        let zoomLevel = 0;
        let translateX = 0;
        let translateY = 0;
        const moveStep = 50; // pixels to move per key press
        let hasShownIndicator = false; // Track if indicator has been shown
        
        // Calculate image boundaries
        function getImageBoundaries() {
            const imgRect = modalContent.getBoundingClientRect();
            const wrapperRect = wrapper.getBoundingClientRect();
            const scale = zoomLevel === 0 ? 1 : (zoomLevel * 0.5 + 1);
            const imgWidth = imgRect.width * scale;
            const imgHeight = imgRect.height * scale;
            
            return {
                left: Math.min(0, (wrapperRect.width - imgWidth) / 2),
                right: Math.max(0, (wrapperRect.width + imgWidth) / 2 - wrapperRect.width),
                top: Math.min(0, (wrapperRect.height - imgHeight) / 2),
                bottom: Math.max(0, (wrapperRect.height + imgHeight) / 2 - wrapperRect.height)
            };
        }
        
        function updateZoom() {
            // Remove all zoom classes and reset position
            modalContent.classList.remove('zoomed-1', 'zoomed-2', 'zoomed-3', 'zoomed-4', 'zoomed-5');
            translateX = 0;
            translateY = 0;
            wrapper.style.transform = '';
            
            // Add appropriate zoom class
            if (zoomLevel > 0) {
                modalContent.classList.add(`zoomed-${zoomLevel}`);
            }
            
            // Update zoom level indicator
            zoomLevelIndicator.textContent = `Zoom: ${zoomLevel === 0 ? '1x' : `${zoomLevel * 0.5 + 1}x`}`;
            
            // Show navigation indicator only once when zooming in
            if (zoomLevel > 0 && !hasShownIndicator) {
                hasShownIndicator = true;
                navIndicator.style.display = 'flex';
                navIndicator.classList.remove('hidden');
                
                // Auto-hide after 3 seconds
                clearTimeout(navIndicator.hideTimeout);
                navIndicator.hideTimeout = setTimeout(() => {
                    navIndicator.classList.add('hidden');
                }, 3000);
            } else if (zoomLevel === 0) {
                hasShownIndicator = false;
                navIndicator.style.display = 'none';
            }
        }
        
        // Zoom in button
        zoomInBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (zoomLevel < 5) {
                zoomLevel++;
                updateZoom();
            }
        });
        
        // Zoom out button
        zoomOutBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (zoomLevel > 0) {
                zoomLevel--;
                updateZoom();
            }
        });
        
        // Close button
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            imageModal.classList.remove('active');
        });
        
        // Keyboard controls
        function handleKeyDown(e) {
            if (!imageModal.classList.contains('active')) return;
            
            switch(e.key) {
                case 'PageUp':
                    e.preventDefault();
                    if (zoomLevel < 5) {
                        zoomLevel++;
                        updateZoom();
                    }
                    break;
                case 'PageDown':
                    e.preventDefault();
                    if (zoomLevel > 0) {
                        zoomLevel--;
                        updateZoom();
                    }
                    break;
                case 'ArrowLeft':
                case 'ArrowRight':
                case 'ArrowUp':
                case 'ArrowDown':
                    if (zoomLevel > 0) {
                        e.preventDefault();
                        // Handle movement
                        const boundaries = getImageBoundaries();
                        let newX = translateX;
                        let newY = translateY;
                        
                        switch(e.key) {
                            case 'ArrowLeft':
                                newX = translateX + moveStep;
                                if (newX <= boundaries.right) {
                                    translateX = newX;
                                }
                                break;
                            case 'ArrowRight':
                                newX = translateX - moveStep;
                                if (newX >= boundaries.left) {
                                    translateX = newX;
                                }
                                break;
                            case 'ArrowUp':
                                newY = translateY + moveStep;
                                if (newY <= boundaries.bottom) {
                                    translateY = newY;
                                }
                                break;
                            case 'ArrowDown':
                                newY = translateY - moveStep;
                                if (newY >= boundaries.top) {
                                    translateY = newY;
                                }
                                break;
                        }
                        
                        wrapper.style.transform = `translate(${translateX}px, ${translateY}px)`;
                    }
                    break;
                case 'Escape':
                    imageModal.classList.remove('active');
                    break;
            }
        }
        
        document.addEventListener('keydown', handleKeyDown);
        
        // Clean up event listener when modal is closed
        imageModal.addEventListener('click', function closeModal(e) {
            if (e.target === imageModal) {
                imageModal.classList.remove('active');
                document.removeEventListener('keydown', handleKeyDown);
                imageModal.removeEventListener('click', closeModal);
            }
        });
        
        // Initial zoom level update
        updateZoom();
    }

    // Render items list
    function renderItems() {
        itemsList.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // If search is empty, show all items
        if (!searchTerm) {
            savedItems.forEach(item => createItemElement(item));
            return;
        }
        
        // Filter items based on search term
        const filteredItems = savedItems.filter(item => {
            // Always exclude images from text search
            if (item.isImage) {
                return false;
            }
            return item.text.toLowerCase().includes(searchTerm);
        });

        // Render filtered items
        filteredItems.forEach(item => createItemElement(item));
    }

    function createItemElement(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'saved-item';
        itemElement.dataset.id = item.id;
        
        const contentElement = document.createElement('div');
        contentElement.className = 'saved-item-content';
        
        if (item.isImage) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-container';
            
            const img = document.createElement('img');
            img.src = item.text;
            img.alt = 'Saved image';
            img.className = 'saved-image';
            
            // Add click handler to show full-size image
            imgContainer.addEventListener('click', function() {
                showFullSizeImage(item.text);
            });
            
            imgContainer.appendChild(img);
            contentElement.appendChild(imgContainer);
        } else {
            contentElement.textContent = item.text;
            if (item.isLink) {
                contentElement.classList.add('link');
            }
        }
        
        // Add click handler for links
        if (item.isLink) {
            if (doubleClickEdit.checked) {
                let clickTimer;
                contentElement.addEventListener('click', function(e) {
                    // Don't open link if clicking on expand button or its parent
                    if (e.target.closest('.expand-btn') || e.target.closest('.button-container')) {
                        return;
                    }
                    
                    if (e.detail === 1) { // Single click
                        clickTimer = setTimeout(() => {
                            if (!this.classList.contains('editing')) {
                                window.open(item.text, '_blank');
                            }
                        }, 250); // Wait to see if it's a double click
                    }
                });

                contentElement.addEventListener('dblclick', function(e) {
                    // Don't edit if clicking on expand button or its parent
                    if (e.target.closest('.expand-btn') || e.target.closest('.button-container')) {
                        return;
                    }
                    clearTimeout(clickTimer); // Cancel the single click action
                    editItem(this, item);
                });
            } else {
                // When double-click editing is off, open link immediately on click
                contentElement.addEventListener('click', function(e) {
                    // Don't open link if clicking on expand button or its parent
                    if (e.target.closest('.expand-btn') || e.target.closest('.button-container')) {
                        return;
                    }
                    if (!this.classList.contains('editing')) {
                        window.open(item.text, '_blank');
                    }
                });
            }
        } else if (doubleClickEdit.checked && !item.isImage) {
            contentElement.addEventListener('dblclick', function(e) {
                // Don't edit if clicking on expand button or its parent
                if (e.target.closest('.expand-btn') || e.target.closest('.button-container')) {
                    return;
                }
                editItem(this, item);
            });
        }
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        // Add expand button if enabled and content is expandable
        if (showExpandBtn.checked && (item.text.length > 100 || item.isImage || item.isLink)) {
            const expandButton = document.createElement('button');
            expandButton.className = 'expand-btn';
            expandButton.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>';
            expandButton.title = 'Expand/Collapse';
            expandButton.style.display = 'flex';
            
            expandButton.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
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
        
        itemsList.appendChild(itemElement);
    }
}); 