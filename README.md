# rektSafe

**Dead Man's Switch for Your Crypto & Data**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A decentralized, client-only dead man's switch that safely passes your crypto, files, and sensitive data to your loved ones if something happens to you.

![Cypherpunk Theme](https://img.shields.io/badge/Theme-Cypherpunk-00ff88)
![Crypto](https://img.shields.io/badge/Crypto-AES--256%2FEd25519-00d4ff)

## 🚀 Features

- **🔐 Threshold Signatures (TSS)** - Split secrets across multiple parties
- **🔒 Zero-Knowledge Encryption** - AES-256-GCM, client-side only
- **⏰ Dead Man's Switch** - Automated inactivity timers
- **👥 Beneficiary System** - Designate trusted guardians
- **📁 File Encryption** - Secure any file type
- **🌐 Fully Decentralized** - No servers, no accounts, no tracking

## 🎨 Design

- Dark cypherpunk aesthetic with neon accents
- Pixar-level animations using Framer Motion
- Cyberpunk/hacker narrative
- Responsive design for all devices

## 🛠 Technology Stack

- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Cryptography**: Web Crypto API (Ed25519, AES-256-GCM, SHA-256)
- **Language**: TypeScript

## 📁 Project Structure

```
my-app/
├── app/                    # Next.js app directory
│   ├── app/               # Crypto playground (TSS demo)
│   ├── privacy/           # Privacy policy page
│   ├── terms/             # Terms of service page
│   ├── globals.css        # Global styles + cypherpunk theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── navbar.tsx         # Navigation with glitch effects
│   ├── footer.tsx         # Minimal footer
│   ├── hero.tsx           # Animated hero section
│   ├── features.tsx       # Feature cards
│   ├── how-it-works.tsx   # Process steps
│   ├── tech-stack.tsx     # Technology showcase
│   └── cta.tsx            # Call to action
└── components/ui/         # shadcn/ui components
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to the app directory
cd my-app

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🔐 Security

- **Client-Side Only**: All crypto operations happen in your browser
- **Zero Knowledge**: We never see your keys or data
- **Standard Primitives**: Ed25519, AES-256-GCM, SHA-256 via Web Crypto API
- **Open Source**: Fully auditable code

⚠️ **Warning**: This is experimental software. Use at your own risk. Always test thoroughly before entrusting valuable assets.

## 📝 Pages

- **Home** (`/`) - Landing page with features and how it works
- **App** (`/app`) - Interactive TSS encryption/decryption demo
- **Privacy** (`/privacy`) - Privacy policy
- **Terms** (`/terms`) - Terms of service

## 🎨 Theme Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#00ff88` | Neon green, main accent |
| Accent | `#ff006e` | Neon pink, highlights |
| Cyan | `#00d4ff` | Secondary accent |
| Background | `#0a0a0f` | Dark background |
| Card | `#12121a` | Card backgrounds |

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is provided "as is" without warranty of any kind. The authors and contributors are not responsible for lost funds, data, or keys. Always maintain secure backups.

---

Built with 💚 for the cypherpunks.

```
[SECURE] [DECENTRALIZED] [TRUSTLESS]
```
