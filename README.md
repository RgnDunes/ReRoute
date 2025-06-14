# ReRoute - URL Redirect Manager

A modern Chrome Extension that allows you to define URL redirect rules and automatically apply them when matching URLs are visited.

<img width="370" alt="Screenshot 2025-06-15 at 2 02 44 AM" src="https://github.com/user-attachments/assets/19a956af-e0d7-4109-885f-a0df0633ae13" />

<img width="365" alt="Screenshot 2025-06-15 at 2 02 49 AM" src="https://github.com/user-attachments/assets/201cbf49-e5a7-4d90-b896-b19c9d162452" />

<img width="1512" alt="Screenshot 2025-06-15 at 2 02 57 AM" src="https://github.com/user-attachments/assets/800310e9-7bec-4d72-8e07-3f5e0a7502c7" />

<img width="1512" alt="Screenshot 2025-06-15 at 2 02 57 AM" src="https://github.com/user-attachments/assets/7d556163-2694-49dd-95e8-ff16f16fbdcd" />

<img width="1512" alt="Screenshot 2025-06-15 at 2 03 19 AM" src="https://github.com/user-attachments/assets/00abd67f-5c06-4c81-8c07-4b0035123426" />

## Features

- **Create, Edit, and Delete Redirect Rules**

  - Each rule includes description, pattern, redirect URL, and more
  - Support for both wildcard patterns and regular expressions
  - Live preview of redirects before saving

- **Rule Priority Control**

  - Move rules up/down to define priority order
  - First matching rule will be applied

- **Enable/Disable Individual Rules**

  - Quickly toggle rules without deleting them

- **Import/Export Rules as JSON**

  - Backup your rules
  - Share rules between browsers or users

- **Sync Support**

  - Optional Chrome sync to share rules across your devices
  - Toggle between local and sync storage

- **Dark Mode Support**
  - Choose between light and dark themes

## Use Cases

- **Privacy Enhancement**: Redirect from tracking-heavy sites to privacy-friendly alternatives

  - Google Search → DuckDuckGo
  - Twitter → Nitter
  - YouTube → Invidious
  - Reddit → Libreddit

- **Development and Testing**: Automatically redirect between development, staging, and production environments

- **URL Cleanup**: Remove tracking parameters from URLs

- **Custom Shortcuts**: Create your own URL shortening system with memorable patterns

## Installation

### From Chrome Web Store

_(Coming soon)_

### Manual Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The ReRoute extension is now installed

## Usage

### Creating a Redirect Rule

1. Click the ReRoute icon in your browser toolbar
2. Click "Add New Rule" or "Manage All Rules"
3. Fill in the rule details:
   - **Description**: A name for your rule
   - **Pattern Type**: Choose Wildcard or Regular Expression
   - **Include Pattern**: The URL pattern to match
   - **Redirect To**: The destination URL (can include placeholders like $1, $2)
   - **Example URL**: Test URL to preview the redirect
4. Click "Test" to see a preview of the redirect
5. Click "Save Rule" to add the rule

### Pattern Examples

#### Wildcard Pattern

- Pattern: `https://www.google.com/search?q=*`
- Redirect: `https://duckduckgo.com/?q=$1`
- Example URL: `https://www.google.com/search?q=privacy`
- Result: `https://duckduckgo.com/?q=privacy`

#### Regular Expression Pattern

- Pattern: `https://twitter.com/([^/]+)`
- Redirect: `https://nitter.net/$1`
- Example URL: `https://twitter.com/username`
- Result: `https://nitter.net/username`

#### Advanced Regular Expression Pattern

- Pattern: `https://(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]+)(?:&.*)?`
- Redirect: `https://invidious.io/watch?v=$1`
- Example URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=recommended`
- Result: `https://invidious.io/watch?v=dQw4w9WgXcQ`

### Managing Rules

- **Enable/Disable**: Toggle the switch next to each rule
- **Edit**: Click the pencil icon to modify a rule
- **Delete**: Click the trash icon to remove a rule
- **Reorder**: Use the up/down arrows to change rule priority

## Permissions

This extension requires the following permissions:

- `tabs`: To access tab URLs
- `storage`: To store your redirect rules
- `declarativeNetRequest`: To implement URL redirection
- `declarativeNetRequestWithHostAccess`: To apply redirects to specific hosts
- `<all_urls>`: To redirect any URL

## Privacy

- All data is stored locally in your browser
- No data is sent to any external servers
- Optional sync uses Chrome's built-in sync service
- No tracking or analytics

## Troubleshooting

### Rules Not Working

- Ensure the rule is enabled (toggle switch is on)
- Check that the pattern correctly matches the URL you're visiting
- Verify that higher priority rules aren't overriding your rule
- Try using the "Test" button with an example URL

### Import/Export Issues

- Ensure your JSON file follows the correct format
- Check that all required fields are present in each rule

## Development

### Building from Source

1. Clone the repository: `git clone https://github.com/yourusername/reroute.git`
2. Install dependencies: `npm install`
3. Generate icons: `npm run build`
4. Load the extension in Chrome

### Project Structure

- `manifest.json`: Extension configuration
- `background.js`: Core redirect functionality
- `popup.html/js`: Quick access popup interface
- `options.html/js`: Rule management interface
- `css/`: Stylesheets for the UI
- `icons/`: Extension icons

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License

## Acknowledgments

- Inspired by the original Redirector extension
- Thanks to all contributors and users
