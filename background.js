const MENU_IDS = {
  selection: 'quickclip-save-selection',
  page: 'quickclip-save-page',
  link: 'quickclip-save-link'
};
const KEYBOARD_SHORTCUT = 'Ctrl+Shift+S';
const DEFAULT_BUTTON_SETTINGS = {
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

chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

chrome.contextMenus.onClicked.addListener((info) => {
  const textToSave = getContextValue(info);
  if (textToSave) {
    saveItem(textToSave, getSaveTypeLabel(info.menuItemId));
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'save-selection-or-page') {
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    return;
  }

  const isRestrictedUrl = tab.url && (
    tab.url.startsWith('chrome://') || 
    tab.url.startsWith('edge://') || 
    tab.url.startsWith('about:') || 
    tab.url.startsWith('https://chrome.google.com/webstore') ||
    tab.url.startsWith('https://chromewebstore.google.com') ||
    tab.url.startsWith('https://microsoftedge.microsoft.com/addons')
  );

  if (isRestrictedUrl) {
    saveItem(tab.url, 'Page URL');
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString().trim() || ''
    });

    const selectedText = results?.[0]?.result?.trim();
    if (selectedText) {
      saveItem(selectedText, 'Selected text');
      return;
    }

    if (tab.url) {
      saveItem(tab.url, 'Page URL');
    }
  } catch (error) {
    // Cannot execute script on restricted URLs, so save the page URL instead
    if (tab.url) {
      saveItem(tab.url, 'Page URL');
    }
  }
});

async function createContextMenus() {
  let shortcut = KEYBOARD_SHORTCUT;
  try {
    if (chrome.commands && chrome.commands.getAll) {
      const commands = await chrome.commands.getAll();
      const saveCmd = commands.find(c => c.name === 'save-selection-or-page');
      if (saveCmd && saveCmd.shortcut) {
        shortcut = saveCmd.shortcut;
      }
    }
  } catch (e) {
    // fallback to KEYBOARD_SHORTCUT
  }

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_IDS.selection,
      title: `QuickClip: Save selection (${shortcut})`,
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: MENU_IDS.link,
      title: 'QuickClip: Save link',
      contexts: ['link']
    });

    chrome.contextMenus.create({
      id: MENU_IDS.page,
      title: `QuickClip: Save page (${shortcut})`,
      contexts: ['page']
    });
  });
}

function getContextValue(info) {
  if (info.menuItemId === MENU_IDS.selection) {
    return info.selectionText?.trim() || '';
  }

  if (info.menuItemId === MENU_IDS.link) {
    return info.linkUrl?.trim() || '';
  }

  if (info.menuItemId === MENU_IDS.page) {
    return info.pageUrl?.trim() || '';
  }

  return '';
}

function getSaveTypeLabel(menuItemId) {
  if (menuItemId === MENU_IDS.selection) {
    return 'Selected text';
  }

  if (menuItemId === MENU_IDS.link) {
    return 'Hyperlink';
  }

  if (menuItemId === MENU_IDS.page) {
    return 'Page URL';
  }

  return 'Item';
}

function saveItem(text, sourceLabel = 'Item') {
  chrome.storage.local.get(['savedItems'], (result) => {
    const savedItems = Array.isArray(result.savedItems) ? result.savedItems : [];
    const newItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      text,
      timestamp: new Date().toISOString()
    };

    savedItems.unshift(newItem);
    chrome.storage.local.set({ savedItems }, () => {
      showSaveFeedback(sourceLabel, text);
    });
  });
}

let lastNotificationTime = 0;
const NOTIFICATION_COOLDOWN_MS = 2000;

function showSaveFeedback(sourceLabel, text) {
  const now = Date.now();
  if (now - lastNotificationTime < NOTIFICATION_COOLDOWN_MS) {
    return;
  }
  lastNotificationTime = now;

  chrome.storage.local.get(['buttonSettings'], (result) => {
    const buttonSettings = normalizeButtonSettings(result.buttonSettings);
    const notificationsEnabled = buttonSettings.showSaveNotifications;
    if (!notificationsEnabled) {
      return;
    }

    const preview = text.length > 80 ? `${text.slice(0, 77)}...` : text;

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: `${sourceLabel} saved to QuickClip`,
      message: preview || 'Saved successfully'
    });
  });
}

function normalizeButtonSettings(settings) {
  const normalized = {};
  const sourceSettings = settings && typeof settings === 'object' ? settings : {};

  for (const [key, defaultValue] of Object.entries(DEFAULT_BUTTON_SETTINGS)) {
    normalized[key] = typeof sourceSettings[key] === 'boolean' ? sourceSettings[key] : defaultValue;
  }

  return normalized;
}
