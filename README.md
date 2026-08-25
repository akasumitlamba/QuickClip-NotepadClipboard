<div align="center">

# QuickClip - Notepad Clipboard

</div>

A Chrome extension that combines a notepad and clipboard manager so you can save, organize, and access text snippets without leaving your browser.

![vibes](https://github.com/user-attachments/assets/cb530e4c-9db2-45eb-bd75-b05f97076da8)

## Get the Extension


<img width="18" height="18" alt="image" src="https://github.com/user-attachments/assets/02febd7b-5c6c-44ae-bd89-8bbfe0d3c67d" />[Edge](https://microsoftedge.microsoft.com/addons/detail/icffibdmcbmfnpbjeojmlpechnebmoni)

<img width="16" height="16" alt="image" src="https://github.com/user-attachments/assets/fcb342e1-fafe-473c-8e56-dbb59f8c494d" />[Chrome](https://chromewebstore.google.com/detail/mjdfflpebcmmpipdeeianpjfolmhkmna?utm_source=item-share-cb)

## QuickClip Pro (Free)

Pro adds support for images and links alongside text snippets, custom tags for organization, and a counter for daily task tracking.

<img width="18" height="18" alt="image" src="https://github.com/user-attachments/assets/02febd7b-5c6c-44ae-bd89-8bbfe0d3c67d" />[Edge](https://microsoftedge.microsoft.com/addons/detail/fdpdihkediefiklboeedbcaeamachnlc)

<img width="16" height="16" alt="image" src="https://github.com/user-attachments/assets/fcb342e1-fafe-473c-8e56-dbb59f8c494d" />[Chrome](https://chromewebstore.google.com/detail/ndibnfgbmcfgoeapohknfeeiilgfhdjg?utm_source=item-share-cb)

## What's New in v3.0

- More room to work with, the editing layout has been redesigned to feel less cramped.
- Right-click any selected text and choose "Save to QuickClip", or use `Ctrl + Shift + S` to save without opening the popup.
- Replaced `innerHTML` with `textContent` throughout to close an XSS vulnerability.
- **Character Counter:** Added a live character counter below the text input box to help you track snippet length.

## Features

**Hyperlinks:** URLs are detected automatically and highlighted. Click to open in a new tab, double-click to edit the text.

**Text input:** Write snippets directly or paste from clipboard. Use Shift+Enter for new lines. A live character counter is displayed below the input box.

**Quick save:** Select any text on a page and save it via the right-click context menu ("Save to QuickClip") or the `Ctrl + Shift + S` shortcut, without needing to open the popup.

**Search:** Filters your saved items as you type.

**Themes:** Light and dark mode, toggled from the toolbar.

**Local storage:** Everything stays on your machine, nothing is sent anywhere.

**Undo deletes:** Accidentally deleted something? There's a recover option (can be hidden in settings if you don't need it).

**Editing:** Double-click any saved item to edit it in place. Press Enter to save (configurable).

**Settings:** You can toggle individual buttons on/off (Copy, Delete, Expand, Save, Paste & Save, Recover), enable or disable the search bar, adjust font size, and configure how Enter and double-click behave.

## Installation

1. Clone the repo or download and extract the ZIP.
2. Go to `chrome://extensions/` in Chrome.
3. Turn on Developer mode (top right).
4. Click "Load unpacked" and select the folder.

## Usage

Pin the extension so the icon stays in your toolbar, then click it to open the popup. Type or paste text, hit Save, and it'll show up in your list. From there you can copy, delete, edit, or expand items. Click the settings icon to adjust things to your liking.

## Built With

- HTML5, CSS3, vanilla JavaScript
- Chrome Extension API

## File Structure

```
QuickClip-NotepadClipboard/
├── manifest.json      # Extension config
├── popup.html         # Popup UI
├── styles.css         # Styles
├── popup.js           # Main logic
├── Icons/             # Extension icons
├── PRIVACY.md         # Privacy policy
├── LICENSE
└── README.md
```

## Privacy

[PRIVACY.md](https://github.com/akasumitlamba/QuickClip-NotepadClipboard/blob/V2.0/PRIVACY.md)

## Contributing

Pull requests are welcome.

## Author

**Sumit Kumar Lamba** ([@akasumitlamba](https://github.com/akasumitlamba))
