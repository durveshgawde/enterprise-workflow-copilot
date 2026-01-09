# Workflow AI Generator - Chrome Extension

A Chrome extension that generates AI-powered workflows from any web page content.

## Features

- **Selection Mode**: Highlight text on any page to generate focused workflows
- **Full Page Extraction**: Extract emails, forms, tables, and document content
- **AI Generation**: Uses Gemini AI to convert content into structured workflows
- **Dashboard Integration**: Saved workflows appear in your dashboard

## Setup

### 1. Configure Environment

Copy the example config and add your credentials:

```bash
# In the extension folder:
cp config.example.js config.js
```

Then edit `config.js`:

```javascript
const CONFIG = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  API_BASE_URL: 'http://localhost:8000/api/v1',
  DASHBOARD_URL: 'http://localhost:3000'
};
```

> **Note**: `config.js` is gitignored to keep your credentials safe.

### 2. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `extension` folder from this project
5. The extension icon should appear in your toolbar

### 3. Start Backend & Frontend

```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Usage

1. Click the extension icon in Chrome toolbar
2. Login with your Enterprise Workflow Copilot credentials
3. Navigate to any web page with content
4. Choose:
   - **Selection Mode**: Select specific text to generate workflow
   - **Full Page**: Extract all content and generate workflow
5. Preview the generated workflow
6. Click **Save to Dashboard** to store it
7. View saved workflows in your dashboard

## Files Structure

```
extension/
├── manifest.json          # Chrome extension configuration
├── config.js              # Your credentials (gitignored)
├── config.example.js      # Template for config
├── .gitignore             # Ignores config.js
├── icons/                 # Extension icons (SVG)
├── background/
│   └── background.js      # Service worker for API calls
├── content/
│   ├── content.js         # Message listener
│   ├── extractor.js       # Content extraction
│   ├── selector.js        # Selection mode UI
│   └── content.css        # Selection styles
├── popup/
│   ├── popup.html         # Main popup UI
│   ├── popup.js           # Popup logic
│   ├── popup.css          # Popup styles
│   ├── auth.html          # Login page
│   ├── auth.js            # Authentication
│   ├── preview.html       # Workflow preview
│   └── preview.js         # Preview logic
└── utils/
    ├── api.js             # API client
    └── storage.js         # Chrome storage helpers
```

## Troubleshooting

### "Configuration missing"
- Make sure you copied `config.example.js` to `config.js`
- Fill in your Supabase URL and anon key

### "Cannot connect to server"
- Make sure the backend is running on `localhost:8000`

### "Session expired"
- Click logout and login again with your credentials

### Content not extracting
- Refresh the page and try again
- Some sites with heavy JavaScript may need a moment to load
