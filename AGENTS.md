# AGENTS.md

## Cursor Cloud specific instructions

This is a Chrome Manifest V3 extension (ReadFocus) built with vanilla JavaScript, HTML, and CSS. There is no package manager, no build system, no bundler, and no automated test framework.

### Running the demo page

Serve the project root with any static HTTP server and open `demo/index.html`:

```
python3 -m http.server 8080
# Then open http://localhost:8080/demo/index.html
```

### Loading the extension in Chrome

1. Open `chrome://extensions/` in Google Chrome
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select the `/workspace` directory
4. The extension will inject its content script on all pages served over HTTP

### Testing the extension

Testing is entirely manual (no automated tests exist):

- Navigate to the demo page (`http://localhost:8080/demo/index.html`)
- Open the extension popup and toggle **Enable ReadFocus** to ON
- Use Arrow Down/Up keys to navigate paragraphs, Space to pause/resume auto-scroll, Escape to stop
- The content script (`content/content.js`) runs on all pages; the extension popup (`popup/`) manages settings stored in `chrome.storage.local`

### Gotchas

- Chrome content scripts do not inject on `file://` URLs by default. Always serve the demo via HTTP.
- After changing extension source files, you must click the reload button on `chrome://extensions/` or re-load the unpacked extension for changes to take effect. Hot-reload is not supported.
- The extension uses `chrome.storage.local` APIs, so the popup and content scripts will throw errors if run outside of a Chrome extension context (e.g., in Node.js or a plain browser tab).
