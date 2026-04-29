# 🚀 Running RED-EYE LEAD HUNTER Locally

This guide will help you set up and run the **RED-EYE LEAD HUNTER** project on your local machine for development and testing.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/) (Recommended for faster installs)
- [Google Chrome](https://www.google.com/chrome/) (For testing the extension)

---

## 💻 1. Running the Web App (Landing Page & Dashboard)

The web application is built with **React**, **Vite**, and **Tailwind CSS**.

### Step 1: Install Dependencies
Open your terminal in the root directory of the project and run:

```bash
# Using Bun (Recommended)
bun install

# OR using npm
npm install
```

### Step 2: Start the Development Server
Run the following command to start the local development server:

```bash
# Using Bun
bun run dev

# OR using npm
npm run dev
```

Once started, you can access the application at:  
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 👁️ 2. Loading the Chrome Extension

The extension interacts directly with Google Maps to harvest leads.

1.  Open **Google Chrome**.
2.  Navigate to `chrome://extensions/`.
3.  Enable **"Developer mode"** (toggle switch in the top-right corner).
4.  Click the **"Load unpacked"** button.
5.  Select the `extension` folder inside the `RED-EYE-LEAD-HUNTER` directory.
6.  The **RED EYE** icon should now appear in your extension toolbar.

> [!TIP]
> To test the extension, go to [Google Maps](https://www.google.com/maps) and search for a business. The RED EYE panel will automatically inject into the page.

---

## 🏗️ 3. Building for Production

To create a production-ready build of the web application:

```bash
# Using Bun
bun run build

# OR using npm
npm run build
```

The optimized files will be generated in the `dist/` directory.

---

## 🧪 4. Running Tests

The project uses **Vitest** for unit testing.

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## 📁 Project Structure Recap

- `src/`: React application source code.
- `extension/`: Chrome Extension source code (Background, Content, Popup).
- `public/`: Static assets for the web app.
- `dist/`: Production build output (generated after running build).

---

## 🆘 Troubleshooting

- **Port 5173 is busy**: Vite will automatically try the next available port (e.g., 5174). Check the terminal output for the correct URL.
- **Extension not appearing**: Ensure you are on a `google.com/maps` URL, as the content script is configured to only run there.
- **Dependencies issues**: Try deleting `node_modules` and the lock file (`bun.lockb` or `package-lock.json`) and reinstalling.

---

**Developed by MD SAMIUR RAHMAN TANIM**  
*Vibe Coding for Efficiency*
