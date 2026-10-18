# rektSafe

**Crypto Inheritance & Private Transfers**

> *For Cypherpunks, By Cypherpunks*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A client-side platform for crypto inheritance and private transfers. Split keys with threshold signatures, encrypt sensitive data, and transfer assets privately on Solana or a supported EVM mainnet. RektSafe does not hold your keys or files.

![Cypherpunk Theme](https://img.shields.io/badge/Theme-Cypherpunk-00ff88)
![Crypto](https://img.shields.io/badge/Crypto-AES--256%2FEd25519-00d4ff)
![Package Manager](https://img.shields.io/badge/Package-pnpm-orange)

## 🚀 Features

| Feature | Description |
|---------|-------------|
| **🔐 zkSig** | Threshold signatures—split keys, encrypt files, sign & verify messages |
| **🕵️ zkSend** | Private transfers—shield, send, and unshield on Solana (SOL, USDC, USDT) or a Privacy Cash mainnet: Ethereum (ETH, USDT), Base (ETH, USDC), BNB Smart Chain (BNB, USDT), Robinhood Chain (ETH, USDG) |
| **👛 RektSafe Vault** | Coming-soon hardware wallet at `/wallet/` — self-custody, passkeys, and transaction warnings |
| **⛓️ Multi-Chain** | Solana + EVM wallet support via Reown AppKit |
| **🛡️ Browser Crypto** | AES-256-GCM and Ed25519 in the browser. zkSend adds zero-knowledge proofs |
| **👥 Threshold Recovery** | n-of-k shares. You distribute them. There is no check-in timer and no automatic unlock |
| **📁 File Encryption** | Secure any file type with threshold decryption |
| **🌐 No Custody** | No accounts. RektSafe does not hold keys, shares, or files |
| **👛 Wallet Native** | Connect your Solana or EVM wallet, no new keys needed |

## 🎨 Design

- Dark cypherpunk aesthetic with neon accents
- Pixar-level animations using Framer Motion
- Cyberpunk/hacker narrative
- Responsive design for all devices

## 🛠 Technology Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework. Dev and production builds use Webpack (`--webpack`) because the privacy SDK needs the polyfills in `next.config.ts`. |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | Component library |
| **Framer Motion** | Animations |
| **pnpm** | Package manager |
| **Reown AppKit** | Multi-chain wallet connection (Solana + EVM) |
| **Wagmi / Viem** | EVM chain interaction |
| **Ethers** | EVM transaction signing and utilities |
| **Web Crypto API** | Cryptography (Ed25519, AES-256-GCM, SHA-256) |
| **Privacy Cash SDK** | Private transactions on Solana and supported EVM mainnets |
| **@lightprotocol/hasher.rs** | ZK proof generation |

## 📁 Project Structure

```
rektsafe/
├── app/                  # Next.js app directory
│   ├── zksig/           # zkSig - Threshold signatures
│   ├── zksend/          # zkSend - Private transfers on Solana and EVM mainnets
│   ├── wallet/          # RektSafe Vault - coming-soon hardware wallet (nav label: Wallet)
│   ├── privacy/         # Privacy policy page
│   ├── terms/           # Terms of service page
│   ├── globals.css      # Global styles + cypherpunk theme
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   ├── navbar.tsx       # Navigation with wallet status
│   ├── footer.tsx       # Minimal footer
│   ├── hero.tsx         # Animated hero section
│   ├── features.tsx     # Feature cards
│   ├── hardware-teaser.tsx # Home section linking to RektSafe Vault
│   ├── how-it-works.tsx # Process steps
│   ├── tech-stack.tsx   # Technology showcase
│   ├── wallet-guard.tsx # Wallet auth guard
│   ├── connect-wallet-button.tsx # Multi-chain connect button
│   └── ui/              # shadcn/ui components
├── lib/                 # Utilities and polyfills
│   ├── browser-polyfills/ # Node.js polyfills for browser
│   └── utils.ts         # Utility functions
├── public/
│   ├── og-image.png     # Open Graph and Twitter card, 1200×630
│   ├── og-image.svg     # Source for the card image
│   ├── icon.png         # Wallet connection icon
│   ├── circuit2.wasm    # Ethereum zkSend proving circuit
│   ├── circuit2.zkey
│   └── wasm/            # Solana ZK proof files
├── .github/workflows/   # GitHub Actions
│   └── deploy.yml       # Deploy to GitHub Pages (Node 20, pnpm 10.28.2)
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10 (install via `corepack enable` and `corepack prepare pnpm@10.28.2 --activate`). The lockfile is version 9, so pnpm 8 cannot install it.

### Environment Variables

Create a `.env` file from `.env.example`:

```bash
# Required: Reown AppKit project ID
# Get yours at: https://cloud.reown.com
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id

# Required: Helius RPC for Solana / zkSend balance fetching
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

# Serve the static production build (uses `npx serve`)
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Deployment

### GitHub Pages (Automated)

Push to `main` triggers deployment via GitHub Actions. The workflow uses Node.js 20 and pnpm 10.28.2, then runs `pnpm build` and publishes the `dist/` static export.

1. Go to **Settings → Pages**
2. Set **Source** to "GitHub Actions"
3. Push to main branch

## 🔐 Security

- **Client-Side Keys**: Key splitting, encryption, and signing happen in your browser
- **No Custody**: RektSafe does not hold your keys, shares, or files
- **Standard Primitives**: Ed25519, AES-256-GCM, SHA-256 via Web Crypto API
- **ZK Privacy**: Privacy Cash SDK for anonymous transactions
- **Open Source**: Fully auditable code

⚠️ **Warning**: This is experimental software. Use at your own risk. Always test thoroughly before entrusting valuable assets.

## 📝 Pages

- **Home** (`/`) - Landing page with features and how it works
- **zkSig** (`/zksig/`) - Threshold signatures - split keys, encrypt, sign & verify
- **zkSend** (`/zksend/`) - Private shielding and transfers. Solana: SOL, USDC, USDT. EVM follows the wallet's selected Privacy Cash mainnet: Ethereum (ETH, USDT), Base (ETH, USDC), BNB Smart Chain (BNB, USDT), Robinhood Chain (ETH, USDG).
- **Wallet** (`/wallet/`) - RektSafe Vault, a coming-soon hardware security device. The navbar label is Wallet.
- **Privacy** (`/privacy/`) - Privacy policy
- **Terms** (`/terms/`) - Terms of service

### RektSafe Vault

`/wallet/` is a launch page, not a checkout. It describes a hardware device that combines:

- Crypto self-custody for Ethereum, Solana, and supported assets, with keys kept in secure hardware
- Identity tools: FIDO2/WebAuthn passkeys, hardware 2FA, and TOTP/HOTP codes. Encrypted password storage is planned, not shipped
- An AI Guardian that turns supported signing requests into plain-language warnings on the device

The page also outlines two stages. V1 uses cloud-assisted analysis through a connected phone or laptop, with signing still on the device. V2 is compact on-device AI for offline explanations. Both versions share the proposed ESP32-S3 + NXP SE050E2 foundation, with a screen, physical approval buttons, and USB-C.

The EAL5+/EAL6+ line on the page is an evaluation pathway. The device is not certified yet. There is no price or ship date on the site. Launch news goes out on [X](https://x.com/netsepio) (@NetSepio) and [Telegram](https://t.me/RektSafeOfficial).

## 🔖 Metadata

Each public route has a title, description, canonical URL, and Open Graph / Twitter card. The shared card image is `public/og-image.png` at 1200×630. Client pages keep their copy in a route `layout.tsx`, because a `"use client"` page cannot export metadata. The project account on the cards is [@NetSepio](https://x.com/netsepio).

## ⛓️ Wallet & Networks

- Connect a **Solana** wallet (Phantom, Solflare, etc.) to use `zkSig` and `zkSend`.
- Connect an **EVM** wallet (MetaMask, WalletConnect, etc.) on a **Privacy Cash mainnet**. zkSend uses the network selected in the wallet: Ethereum (ETH, USDT), Base (ETH, USDC), BNB Smart Chain (BNB, USDT), or Robinhood Chain (ETH, USDG). Other EVM networks, including testnets, are asked to switch to one of those mainnets.
- The navbar shows the connected network, address, and current native balance.

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
