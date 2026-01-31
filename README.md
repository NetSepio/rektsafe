# rektSafe

**Dead Man's Switch for Your Crypto & Data**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A decentralized, client-only dead man's switch that safely passes your crypto, files, and sensitive data to your loved ones if something happens to you.

![Cypherpunk Theme](https://img.shields.io/badge/Theme-Cypherpunk-00ff88)
![Crypto](https://img.shields.io/badge/Crypto-AES--256%2FEd25519-00d4ff)
![Package Manager](https://img.shields.io/badge/Package-pnpm-orange)

## 🚀 Features

- **🔐 Threshold Signatures (TSS)** - Split secrets across multiple parties
- **🔒 Zero-Knowledge Encryption** - AES-256-GCM, client-side only
- **🕵️ Private Transfers** - Shield, send, and unshield assets via zkSend
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

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | Component library |
| **Framer Motion** | Animations |
| **pnpm** | Package manager |
| **Web Crypto API** | Cryptography (Ed25519, AES-256-GCM, SHA-256) |
| **Privacy Cash SDK** | Private transactions on Solana |
| **@lightprotocol/hasher.rs** | ZK proof generation |

## 📁 Project Structure

```
rektsafe/
├── app/                   # Next.js app directory
│   ├── vault/            # Crypto vault (TSS app)
│   ├── zksend/           # Private transfers (zkSend)
│   ├── privacy/          # Privacy policy page
│   ├── terms/            # Terms of service page
│   ├── globals.css       # Global styles + cypherpunk theme
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── navbar.tsx        # Navigation with glitch effects
│   ├── footer.tsx        # Minimal footer
│   ├── hero.tsx          # Animated hero section
│   ├── features.tsx      # Feature cards
│   ├── how-it-works.tsx  # Process steps
│   ├── tech-stack.tsx    # Technology showcase
│   ├── wallet-guard.tsx  # Wallet auth guard
│   ├── wallet-session-provider.tsx  # Session management
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and polyfills
│   ├── browser-polyfills/ # Node.js polyfills for browser
│   ├── wallet-session.ts  # Wallet session management
│   └── utils.ts          # Utility functions
├── public/wasm/          # WASM files for ZK proofs
├── .github/workflows/    # GitHub Actions
│   └── deploy.yml        # Deploy to GitHub Pages
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (install via `npm install -g pnpm`)

### Environment Variables

Create a `.env` file:

```bash
# Required: Get from https://cloud.reown.com
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id

# Required: Get from https://helius.dev
NEXT_PUBLIC_HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=your_key

# Optional: Custom Solana RPC fallback
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
```

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Deployment

### GitHub Pages (Automated)

Push to `main` branch triggers automatic deployment via GitHub Actions.

1. Go to **Settings → Pages**
2. Set **Source** to "GitHub Actions"
3. Push to main branch

## 🔐 Security

- **Client-Side Only**: All crypto operations happen in your browser
- **Zero Knowledge**: We never see your keys or data
- **Standard Primitives**: Ed25519, AES-256-GCM, SHA-256 via Web Crypto API
- **ZK Privacy**: Privacy Cash SDK for anonymous transactions
- **Open Source**: Fully auditable code

⚠️ **Warning**: This is experimental software. Use at your own risk. Always test thoroughly before entrusting valuable assets.

## 📝 Pages

- **Home** (`/`) - Landing page with features and how it works
- **Vault** (`/vault/`) - Interactive TSS encryption/decryption app
- **zkSend** (`/zksend/`) - Private asset shielding and transfers
- **Privacy** (`/privacy/`) - Privacy policy
- **Terms** (`/terms/`) - Terms of service

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
