# Wellness Timer PWA

A minimalistic Progressive Web Application for wellness breaks and productivity. Built with Next.js and **zero external runtime dependencies**.

🌐 **Live Demo**: [https://maniadav.github.io/wellness-timer](https://maniadav.github.io/wellness-timer)

## 🌟 Features

- **Timer Presets**: Pomodoro, 20-20-20 Rule, Eye Stretching, and Custom timers
- **PWA Support**: Installable on desktop and mobile devices
- **Offline Capable**: Works without internet after installation
- **System Notifications**: Browser notifications for phase transitions
- **Dark/Light Mode**: Gray-themed dark mode with smooth transitions
- **Responsive Design**: Works on all screen sizes
- **Zero Dependencies**: No external runtime libraries or UI frameworks

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom implementations (no external UI library)
- **Icons**: Inline SVG (no icon library)
- **PWA**: Native Service Worker
- **Deployment**: GitHub Pages with GitHub Actions

## 📁 Project Structure

\`\`\`
wellness-timer/
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions deployment workflow
├── app/
│   ├── layout.tsx          # Root layout with PWA meta tags
│   ├── page.tsx            # Main timer application
│   └── globals.css         # Global styles and theme variables
├── components/
│   └── ui.tsx              # All custom UI components in one file
├── public/
│   ├── sw.js               # Service worker for PWA functionality
│   ├── manifest.json       # PWA manifest
│   └── icon-*.png          # App icons
├── next.config.mjs         # Next.js configuration for static export
└── package.json            # Dependencies and scripts
\`\`\`

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/maniadav/wellness-timer.git
   cd wellness-timer
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Build for production**
   \`\`\`bash
   npm run build
   \`\`\`

### Deployment to GitHub Pages

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as the source
   - The workflow will automatically deploy on push to main

3. **Access your app**
   - Your app will be available at: \`https://maniadav.github.io/wellness-timer\`

## 📱 Installation

The app can be installed as a PWA on any modern browser. Look for the download icon in the header or use your browser's install prompt.

## 🎯 Usage

1. Select a timer preset or create custom durations
2. Click Start to begin your work session
3. Take breaks when notified
4. Track your productivity cycles

## 🔧 Development Philosophy

This app is built with **minimal external dependencies**:
- ✅ Only essential Next.js packages
- ✅ No external UI libraries (shadcn/ui, Material-UI, etc.)
- ✅ No icon libraries (Lucide, Heroicons, etc.)
- ✅ Custom theme management without next-themes
- ✅ All UI components in a single file
- ✅ Inline SVG icons
- ✅ Native browser APIs for PWA features

## 🎨 Custom Components

All UI components are custom-built and located in \`/components/ui.tsx\`:
- Button with multiple variants
- Card components (Card, CardHeader, CardTitle, etc.)
- Input and Label
- Switch toggle
- Progress bar
- Dialog modal system
- Badge and Separator

## 🚀 GitHub Actions Workflow

The deployment is automated using GitHub Actions:
- **Trigger**: Push to main branch
- **Build**: Next.js static export
- **Deploy**: Automatic deployment to GitHub Pages
- **Cache**: Node modules caching for faster builds

## 📄 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with ❤️ for better productivity and wellness.
