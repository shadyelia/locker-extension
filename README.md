# 🔒 Locker - Website Lock Extension

**Locker** is an open-source Chrome extension built using **React** and **TypeScript** that helps you **temporarily block distracting websites** like YouTube, Twitch, etc.

---

## ✨ Features

- ⏱️ Lock websites for a specific duration (e.g. 15 minutes, 1 hour, until a certain date).
- 📆 Automatically unlocks when time expires.
- ✅ Works with or without "[www](http://www)." prefixes (e.g., `www.twitch.tv`, `twitch.tv`, etc.)
- 💡 Built with React and TypeScript using Vite.
- 🔐 Local state is persisted using `chrome.storage.local`.
- 🚫 Redirects blocked domains to a friendly `block.html` page.
- 💻 Modern and polished UI.

---

## 🧠 How It Works

1. The extension injects a **content script** that monitors the current domain.
2. If the domain is locked, the browser is redirected to a `block.html` page.
3. Timers are managed using `chrome.storage.local` and background events.
4. You can add and remove locks using the React popup UI.

---

## 📦 Installation

### 🧪 For Development:

```bash
# Clone the repo
$ git clone https://github.com/yourusername/locker.git
$ cd locker

# Install dependencies
$ npm install

# Start development server
$ npm run dev
```

### 🔧 Load into Chrome:

1. Run `npm run build`
2. Go to `chrome://extensions/`
3. Enable **Developer Mode**
4. Click **Load Unpacked**
5. Select the `dist` folder

Now the extension is active and ready to use 🚀


---

## 🚀 Build for Production

```bash
npm run build
```

This generates the extension bundle in the `dist/` directory.


