# ReRoute - URL Redirect Manager

A modern Chrome Extension that allows you to define URL redirect rules and automatically apply them when matching URLs are visited.

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

## Permissions

This extension requires the following permissions:

- `tabs`: To access tab URLs
- `webNavigation`: To intercept and redirect navigation
- `storage`: To store your redirect rules
- `<all_urls>`: To redirect any URL

## Privacy

- All data is stored locally in your browser
- No data is sent to any external servers
- Optional sync uses Chrome's built-in sync service

## License

MIT License
