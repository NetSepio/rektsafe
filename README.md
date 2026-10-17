# rektSafe

**Zero-Knowledge Crypto Inheritance & Private Transfers**

> *For Cypherpunks, By Cypherpunks*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A decentralized, zero-knowledge platform for crypto inheritance and private transfers. Split your keys with threshold signatures, encrypt sensitive data, and transfer assets privately on Solana or Ethereum — all client-side, no servers, no tracking.

![Cypherpunk Theme](https://img.shields.io/badge/Theme-Cypherpunk-00ff88)
![Crypto](https://img.shields.io/badge/Crypto-AES--256%2FEd25519-00d4ff)
![Package Manager](https://img.shields.io/badge/Package-pnpm-orange)

## 🚀 Features

| Feature | Description |
|---------|-------------|
| **🔐 zkSig** | Threshold signatures—split keys, encrypt files, sign & verify messages |
| **🕵️ zkSend** | Private transfers—shield, send, and unshield on Solana (SOL, USDC, USDT) or Ethereum (ETH, USDT) |
| **🔒 zkVault** | NFT-based lending vault for yield and borrowing |
| **👛 RektSafe Vault** | Coming-soon hardware wallet at `/wallet/` — self-custody, passkeys, and transaction warnings |
| **⛓️ Multi-Chain** | Solana + EVM wallet support via Reown AppKit |
| **🛡️ Zero-Knowledge** | AES-256-GCM + Ed25519, everything client-side |
| **⏰ Dead Man's Switch** | Automated inactivity triggers for inheritance |
| **👥 Multi-Party** | n-of-k threshold scheme for distributed trust |
| **📁 File Encryption** | Secure any file type with threshold decryption |
| **🌐 Fully Decentralized** | No servers, no accounts, no tracking |
| **👛 Wallet Native** | Connect your Solana or EVM wallet, no new keys needed |

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
| **Reown AppKit** | Multi-chain wallet connection (Solana + EVM) |
| **Wagmi / Viem** | EVM chain interaction |
| **Ethers** | EVM transaction signing and utilities |
| **Web Crypto API** | Cryptography (Ed25519, AES-256-GCM, SHA-256) |
| **Privacy Cash SDK** | Private transactions on Solana and Ethereum |
| **@lightprotocol/hasher.rs** | ZK proof generation |

## 📁 Project Structure

```
rektsafe/
├── app/                  # Next.js app directory
│   ├── zksig/           # zkSig - Threshold signatures (TSS/DMS)
│   ├── zksend/          # zkSend - Private transfers on Solana and Ethereum
│   ├── zkvault/         # zkVault - NFT-based lending vault
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
├── public/wasm/         # WASM files for ZK proofs
├── .github/workflows/   # GitHub Actions
│   └── deploy.yml       # Deploy to GitHub Pages
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (install via `npm install -g pnpm`)

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

# Optional: zkVault multisig deposit address
NEXT_PUBLIC_VAULT_ADDRESS=your_multisig_vault_address

# Optional: Supabase for zkVault request storage (uses mock storage if not set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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
- **zkSig** (`/zksig/`) - Threshold signatures - split keys, encrypt, sign & verify
- **zkSend** (`/zksend/`) - Private shielding and transfers. Solana: SOL, USDC, USDT. Ethereum mainnet: ETH, USDT.
- **zkVault** (`/zkvault/`) - NFT-based lending vault positions and yield
- **Wallet** (`/wallet/`) - RektSafe Vault, a coming-soon hardware security device. The navbar label is Wallet. This is not zkVault.
- **Privacy** (`/privacy/`) - Privacy policy
- **Terms** (`/terms/`) - Terms of service

### RektSafe Vault

`/wallet/` is a launch page, not a checkout. It describes a hardware device that combines:

- Crypto self-custody for Ethereum, Solana, and supported assets, with keys kept in secure hardware
- Identity tools: FIDO2/WebAuthn passkeys, hardware 2FA, and TOTP/HOTP codes. Encrypted password storage is planned, not shipped
- An AI Guardian that turns supported signing requests into plain-language warnings on the device

The page also outlines two stages. V1 uses cloud-assisted analysis through a connected phone or laptop, with signing still on the device. V2 is compact on-device AI for offline explanations. Both versions share the proposed ESP32-S3 + NXP SE050E2 foundation, with a screen, physical approval buttons, and USB-C.

The EAL5+/EAL6+ line on the page is an evaluation pathway. The device is not certified yet. There is no price or ship date on the site. Launch news goes out on [X](https://x.com/netsepio) and [Telegram](https://t.me/RektSafeOfficial).

## ⛓️ Wallet & Networks

- Connect a **Solana** wallet (Phantom, Solflare, etc.) to use `zkSig`, `zkSend`, and `zkVault`.
- Connect an **EVM** wallet (MetaMask, WalletConnect, etc.) on **Ethereum mainnet** to shield and send ETH or USDT in `zkSend`. Other EVM networks are asked to switch to Ethereum.
- The navbar shows the connected address and current native balance for the selected network.

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
