# QuickClip - Staging Release

A Chromium extension that combines the functionality of a notepad and clipboard manager, allowing you to save, organize, and quickly access your text snippets.

![1](https://github.com/user-attachments/assets/56880205-0d0e-4f09-8ea2-84cd99010cbc)

## Features

- ✍️ **Text Input**: Write and save text snippets with support for multiline input
- 📋 **Clipboard Integration**: Paste and save text directly from your clipboard
- 🔍 **Search Functionality**: Quickly find saved items with instant search
- 🎨 **Theme Support**: Switch between light and dark themes with a single click
- 📱 **Responsive Design**: Clean and modern interface
- 💾 **Local Storage**: All your snippets are saved locally
- 🔄 **Copy & Delete**: Easy management of saved items
- ⚙️ **Customizable Settings**: 
  - Toggle visibility of action buttons (Copy, Delete, Expand, Save, Paste & Save)
  - Enable/disable search bar
  - Configure Enter key behavior for saving
  - Enable double-click to edit saved items
  - Adjust font size to your preference
- 📝 **Enhanced Editing**:
  - Double-click any saved item to edit it
  - Press Enter to save (configurable)
  - Expand/collapse long text items
  - Copy items to clipboard with one click
- 🎯 **User Experience**:
  - Smooth animations and transitions
  - New & updated icons
  - Responsive layout that adapts to your needs
  - Action selection

## Installation

1. Clone this repository or download the ZIP file & extract it.
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extracted directory

## Usage

1. Click the QuickClip icon in your Chrome toolbar to open the popup(make sure you pin it)
2. Enter text in the text area or use the "Paste & Save" button to save clipboard content
3. Use Shift+Enter for new lines
4. Search through your saved items using the search bar
5. Click the theme toggle to switch between light and dark themes
6. Use the copy and delete buttons to manage your saved items
7. Double-click any saved item to edit it
8. Click the settings button to customize the extension to your preferences
9. Use the font size controls to adjust text size
10. Expand/collapse long text items for better readability

## Development

The extension is built using:
- HTML5
- CSS3
- JavaScript
- Chrome Extension API

### File Structure

```
QuickClip-NotepadClipboard/
├── manifest.json      # Extension configuration
├── popup.html         # Main popup interface
├── styles.css         # Styling for the popup
├── popup.js           # Main functionality
└── README.md          # Documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

👤 **Sumit Lamba**
- GitHub: [@akasumitlamba](https://github.com/akasumitlamba)

## Acknowledgments

- Inspired by the need for a simple, efficient clipboard manager
