# ReadFocus - Active Paragraph Highlighter

A Chrome extension that highlights the paragraph you're currently reading and auto-scrolls to keep your place. Designed for reading long content like ChatGPT responses, documentation, articles, and blog posts.

## The Problem

When reading long AI responses or articles, it's easy to lose your place - especially when looking away from the screen to speak, think, or take notes. Text above and below blends together, and finding where you left off wastes time.

## The Solution

ReadFocus solves this by:

- **Highlighting the active paragraph** with a visible glow, underline, or background color
- **Dimming surrounding text** so you never confuse adjacent paragraphs
- **Auto-scrolling** at a configurable speed to move through content hands-free
- **Keyboard navigation** for manual control when you want it

## Features

| Feature | Description |
|---------|-------------|
| Paragraph Detection | Automatically finds readable text blocks (`<p>`, `<li>`, headings, code blocks, etc.) |
| Smart Highlighting | Three styles: Glow (default), Underline, or Background fill |
| Dimming Overlay | Dims text above and below the active paragraph (adjustable opacity) |
| Auto-Scroll | Moves to the next paragraph at a configurable speed |
| Keyboard Controls | Arrow keys to navigate, Space to pause, Escape to stop |
| On-Page Controls | Floating buttons for navigation without keyboard |
| Progress Bar | Shows reading progress at the top of the page |
| Works Everywhere | Compatible with any website - ChatGPT, docs, blogs, etc. |
| Customizable Colors | Six preset colors + custom color picker |

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the project folder
5. The ReadFocus icon appears in your extensions toolbar

## Usage

### Quick Start

1. Navigate to any page with text content (e.g., ChatGPT)
2. Click the ReadFocus extension icon in the toolbar
3. Toggle **Enable ReadFocus** to ON
4. The current paragraph is highlighted and auto-scroll begins

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Arrow Down` | Move to next paragraph |
| `Arrow Up` | Move to previous paragraph |
| `Space` | Pause / Resume auto-scroll |
| `Escape` | Stop ReadFocus |

### Settings

Open the extension popup to customize:

- **Highlight Color** - Choose from 6 presets or pick a custom color
- **Highlight Style** - Glow, Underline, or Background
- **Dim Opacity** - How much surrounding text is dimmed (0-80%)
- **Auto-scroll Speed** - Speed 1 (slowest) to 8 (fastest)
- **Show Controls** - Toggle the on-page floating buttons
- **Show Progress** - Toggle the top progress bar

### Refresh Paragraphs

If new content loads on the page (e.g., a new ChatGPT response), click **Refresh Paragraphs** in the popup to re-scan the page.

## Project Structure

```
readfocus/
├── manifest.json           # Chrome extension manifest (V3)
├── background/
│   └── background.js       # Service worker for extension commands
├── content/
│   ├── content.js          # Core logic: detection, highlighting, scrolling
│   └── content.css         # Styles for overlays, highlights, controls
├── popup/
│   ├── popup.html          # Settings UI
│   ├── popup.css           # Popup styles (dark theme)
│   └── popup.js            # Settings logic and storage sync
├── icons/
│   ├── icon16.png          # Toolbar icon
│   ├── icon48.png          # Extension page icon
│   └── icon128.png         # Chrome Web Store icon
└── README.md
```

## How It Works

1. **Paragraph Detection**: The content script scans the page for text elements using CSS selectors. It filters out invisible, empty, or dominated (nested) elements and sorts them by vertical position.

2. **Highlighting**: The active paragraph gets a visual treatment (glow/underline/background) while semi-transparent overlays dim everything above and below it.

3. **Navigation**: Users can navigate manually with keyboard arrows or let auto-scroll advance through paragraphs at a set interval.

4. **Scroll Tracking**: When manually scrolling (or when auto-scroll is paused), the extension detects which paragraph is closest to the viewport center and highlights it.

5. **Storage Sync**: All settings persist via `chrome.storage.local` and apply immediately across tabs.

## Browser Support

- Google Chrome (Manifest V3)
- Microsoft Edge (Chromium-based)
- Brave Browser
- Any Chromium-based browser

## License

MIT
