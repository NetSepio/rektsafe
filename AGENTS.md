# AGENTS.md - rektSafe

> Project context and guidelines for AI agents working on rektSafe

## Project Overview

**rektSafe** is a client-side app for crypto inheritance and private transfers. Threshold signatures (zkSig) split a key into shares you distribute yourself. There is no check-in timer and no automatic unlock. zkSend does private transfers. RektSafe Vault is a coming-soon hardware wallet. Do not add a lending, yield, or NFT-vault product. The old zkVault route was removed because it conflicted with that positioning and with the hardware product name.

- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Crypto**: Web Crypto API (Ed25519, AES-256-GCM, SHA-256), Privacy Cash SDK
- **Theme**: Dark cypherpunk with neon accents
- **Architecture**: Client-side only, static export (no SSR)

## Directory Structure

```
rektsafe/
├── app/                    # Next.js App Router
│   ├── zksig/             # zkSig - Threshold signatures
│   │   ├── page.tsx       # Main zkSig page with tabs
│   │   ├── components/    # Tab section components
│   │   │   ├── tab-navigation.tsx    # Tab switcher UI
│   │   │   ├── split-keys-section.tsx # Generate key shares
│   │   │   ├── encrypt-section.tsx    # File encryption
│   │   │   ├── decrypt-section.tsx    # File decryption
│   │   │   ├── sign-section.tsx       # Message signing
│   │   │   └── verify-section.tsx     # Signature verification
│   │   ├── context/       # TSS context for state management
│   │   │   └── tss-context.tsx
│   │   └── metadata.ts    # Page-specific metadata
│   ├── zksend/            # Private transfers (zkSend)
│   │   ├── page.tsx       # Main zkSend page
│   │   ├── components/    # Shield/Send/Unshield/History sections
│   │   ├── hooks/         # useBalances hook
│   │   ├── lib/           # Privacy Cash SDK wrapper
│   │   └── context/       # Transaction context
│   ├── wallet/            # RektSafe Vault launch page (route /wallet/, nav label Wallet)
│   │   ├── page.tsx       # Coming-soon hardware wallet content
│   │   └── layout.tsx     # Page metadata
│   ├── privacy/           # Privacy policy page
│   ├── terms/             # Terms of service page
│   ├── globals.css        # Cypherpunk theme variables
│   ├── layout.tsx         # Root layout with navbar/footer
│   ├── page.tsx           # Landing page
│   └── metadata.ts        # Shared metadata configs
├── components/            # React components
│   ├── navbar.tsx         # Navigation with glitch effects
│   ├── footer.tsx         # Minimal footer
│   ├── hero.tsx           # Animated hero section
│   ├── features.tsx       # Feature cards
│   ├── hardware-teaser.tsx # Home teaser linking to /wallet/
│   ├── how-it-works.tsx   # Process steps with tabs
│   ├── wallet-provider.tsx # Wallet connection provider
│   ├── wallet-session-provider.tsx # Session management
│   ├── wallet-guard.tsx    # Wallet auth guard
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
│   └── use-sns-name.ts    # SNS domain resolution
├── lib/                   # Utilities and polyfills
│   ├── browser-polyfills/ # Node.js polyfills
│   │   ├── hasher-wasm-init.ts   # WASM initialization
│   │   ├── node-localstorage.ts  # localStorage polyfill
│   │   └── path.ts               # Path polyfill
│   ├── wallet-session.ts  # Wallet session management
│   └── utils.ts           # Utility functions (cn, etc.)
├── public/wasm/           # WASM files for ZK proofs
│   ├── light_wasm_hasher_bg.wasm
│   ├── hasher_wasm_simd_bg.wasm
│   ├── rektsafe.wasm
│   └── rektsafe.zkey
├── .github/workflows/     # GitHub Actions
│   └── deploy.yml         # Deploy to GitHub Pages
├── dist/                  # Build output (excluded from git)
├── package.json
├── next.config.ts         # Static export config
├── tsconfig.json
└── postcss.config.mjs
```

## Key Technologies

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router). `pnpm dev` and `pnpm build` pass `--webpack` so the privacy SDK polyfills in `next.config.ts` apply. Turbopack is the Next.js 16 default and does not read that webpack config. |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Animation | Framer Motion |
| Icons | Lucide React |
| Crypto | Web Crypto API |
| Privacy | Privacy Cash SDK |
| ZK Proofs | @lightprotocol/hasher.rs |
| Wallet | Reown AppKit + Solana |

## Theme Colors

```css
--background: #0a0a0f       /* Deep black */
--foreground: #e0e0e0       /* Light gray */
--primary: #00ff88          /* Neon green */
--accent: #ff006e           /* Neon pink */
--cyan: #00d4ff             /* Electric blue */
--border: #2a2a3e           /* Dark border */
```

## Development Commands

```bash
pnpm install     # Install dependencies
pnpm dev         # Start dev server (http://localhost:3000)
pnpm build       # Build static site to /dist
```

## Environment Variables

```bash
# Required: Get from https://cloud.reown.com
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id

# Required: Helius RPC for Solana
NEXT_PUBLIC_HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=your_key

# Optional: Fallback Solana RPC
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
```

## Deployment

### GitHub Pages (Automated)

A GitHub Actions workflow is configured at `.github/workflows/deploy.yml`:

1. **Push to main/master** triggers automatic deployment
2. **Manual trigger** via Actions tab → "Deploy to GitHub Pages" → Run workflow

**Setup required:**
1. Go to Settings → Pages
2. Source: GitHub Actions
3. Push to main branch to trigger first deploy

**For project pages** (username.github.io/repo-name):
- Base path is auto-configured via `GITHUB_REPOSITORY` env var
- Works out of the box with the workflow

**For custom domain:**
1. Update `next.config.ts`:
   ```typescript
   basePath: "",
   assetPrefix: "",
   ```
2. Add CNAME file to `public/` directory with your domain

## Important Notes

### Client-Side Only
- **NO SSR** - Uses `output: 'export'` in next.config.ts
- All components using browser APIs must have `"use client"` directive
- Crypto operations use Web Crypto API (browser native)

### Static Export Configuration
```typescript
// next.config.ts
const nextConfig = {
  output: "export",
  distDir: "dist",
  images: { unoptimized: true },
  trailingSlash: true,
};
```

### Styling Guidelines
- Use Tailwind CSS utility classes
- Theme colors via CSS variables in `globals.css`
- Custom utility classes:
  - `.gradient-text` - Neon gradient text
  - `.glow-primary` - Green glow effect
  - `.grid-pattern` - Background grid
  - `.scanlines` - CRT scanline effect

### Component Patterns
- Use `motion` from Framer Motion for animations
- Use `useInView` hook for scroll-triggered animations
- Use `Card`, `Button` from `components/ui/`
- Monospace font for "hacker" text: `font-mono`

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/zksig/` | zkSig - Threshold signatures. Solana wallets only. |
| `/zksend/` | Private transfers. Solana: SOL, USDC, USDT. EVM uses the wallet's selected Privacy Cash mainnet: Ethereum (ETH, USDT), Base (ETH, USDC), BNB Smart Chain (BNB, USDT), Robinhood Chain (ETH, USDG). Other EVM networks, including testnets, are asked to switch. |
| `/wallet/` | RektSafe Vault - coming-soon hardware wallet. Navbar label is **Wallet**. Do not add a footer link. Do not label any link just "Vault". The product name is RektSafe Vault. |
| `/privacy/` | Privacy policy |
| `/terms/` | Terms of service |

## zkSig Tabs

The zkSig page uses a tabbed interface similar to zkSend:

| Tab | Component | Description |
|-----|-----------|-------------|
| `split` | `split-keys-section.tsx` | Generate threshold key shares (n-of-k) |
| `encrypt` | `encrypt-section.tsx` | Encrypt files with AES-256-GCM |
| `decrypt` | `decrypt-section.tsx` | Decrypt files using threshold signatures |
| `sign` | `sign-section.tsx` | Sign messages with Ed25519 |
| `verify` | `verify-section.tsx` | Verify Ed25519 signatures |

### State Management

zkSig uses a React Context (`tss-context.tsx`) to share state between tabs:
- Key generation and shares
- Encryption/decryption keys
- File encryption state
- Signature operations

## Build Output

Static files are generated in `/dist/`:
- `index.html` - Home page
- `zksig/index.html` - zkSig threshold signatures
- `zksend/index.html` - Private transfers
- `wallet/index.html` - RektSafe Vault launch page
- `privacy/index.html` - Privacy page
- `terms/index.html` - Terms page
- `_next/` - JS/CSS assets
- `wasm/` - WASM files for Solana ZK proofs
- `circuit2.wasm` and `circuit2.zkey` - Ethereum privacy circuit. The SDK loads them from `keyBasePath` `/circuit` plus the input count `2`.

**Note**: `dist/` is excluded from git (see .gitignore)

## Adding New Pages

1. Create folder in `app/` (e.g., `app/newpage/`)
2. Create `page.tsx` with `"use client"` if needed
3. Update `components/navbar.tsx` navigation links
4. Use existing components as templates

## Common Issues

### Tailwind CSS not working
- Ensure `@import "tailwindcss"` is in `globals.css`
- Check `postcss.config.mjs` has `@tailwindcss/postcss`

### Build fails with "not a module"
- Rename conflicting routes (e.g., `app/` → `demo/`)
- Ensure all imports use `@/` alias correctly

### Static export issues
- All images must use standard `<img>` (not Next.js Image)
- No API routes (client-side only)
- All dynamic routes must be pre-rendered

### WASM loading errors
- Ensure WASM files are in `public/wasm/`
- Check `keyBasePath` in SDK calls uses correct path
- For GitHub Pages, path resolution happens in `hasher-wasm-init.ts`

## Security Considerations

- zkSig key splitting, encryption, and signing run in the browser via the Web Crypto API
- RektSafe does not store keys, shares, or files
- zkSend sends transactions to public RPC endpoints and Privacy Cash relayers. RektSafe does not operate those services
- Users are responsible for key management
- zkSig uses Ed25519, AES-256-GCM, and SHA-256. zkSend adds zero-knowledge proofs for private transfers

## Wallet Integration

Reown AppKit (formerly WalletConnect) is integrated for Solana wallet connections.

### Supported Wallets
- Phantom (browser extension)
- Solflare (browser extension)
- Other wallets via WalletConnect QR

### Wallet Session

The app uses a wallet session system for zkSend:

1. User connects wallet → signs message once
2. Signature derives encryption key via `EncryptionService`
3. Session persists across navigation (in-memory)
4. No need to sign again for shield/send/unshield operations

**Solana signing message** (do not reuse this for Ethereum):
```
Welcome to RektSafe. For Cypherpunks, By Cypherpunks! 

Powered by NetSepio
```

### Components

| Component | Purpose |
|-----------|---------|
| `wallet-provider.tsx` | Initializes AppKit with Solana adapter |
| `wallet-session-provider.tsx` | Manages wallet session state |
| `wallet-guard.tsx` | Blocks access until wallet connected & session initialized |

### Hooks

| Hook | Purpose |
|------|---------|
| `useSnsName(address)` | Resolves wallet address to SNS (.sol) domain name |
| `useWalletSession()` | Access wallet session state and initialization |

### Usage in Components

```tsx
import { useAppKitAccount } from "@reown/appkit/react";
import { useWalletSession } from "@/components/wallet-session-provider";

function MyComponent() {
  const { isConnected, address } = useAppKitAccount();
  const { isInitialized, isLoading } = useWalletSession();
  
  if (isConnected && isInitialized) {
    return <div>Ready for private transfers</div>;
  }
  
  return <Button>Connect Wallet</Button>;
}
```

## RektSafe Vault - Hardware Wallet

Launch page at `app/wallet/`. Public route is `/wallet/`. The navbar calls the link **Wallet** and shows a Soon badge. The navbar label is Wallet, not Vault.

The page is informational. There is no checkout, price, or ship date. Keep these claims exact:

- Crypto self-custody for Ethereum, Solana, and supported assets. Keys stay in secure hardware. Signing needs physical confirmation.
- Identity: FIDO2/WebAuthn for compatible accounts, hardware 2FA, and TOTP/HOTP codes. Encrypted password storage is planned, not available.
- AI Guardian explains supported signing requests on the device. The sample Ethereum unlimited-approval screen is illustrative. Transaction details are verified independently; AI adds context.
- V1 is cloud-assisted analysis through a phone or laptop, with signing on the device. V2 is on-device AI for offline explanations of supported operations.
- Proposed hardware foundation: ESP32-S3 + NXP SE050E2, with a screen, physical approval buttons, and USB-C.
- EAL5+/EAL6+ is an evaluation pathway. Certification is a development objective, not an existing certification.

Home discovery lives in `components/hardware-teaser.tsx` and a hero link. Do not add a footer link for this page.

## Privacy Cash SDK Integration

### Overview
The app integrates `privacycash` for Solana and `privacycash-evm` for the mainnets that SDK supports. zkSend passes the wallet's selected chain into every deposit, withdraw, and balance call. Do not omit `network`: the SDK otherwise falls back to Base.

Solana zkSend still signs `Welcome to RektSafe. For Cypherpunks, By Cypherpunks!` and keeps that signature in memory. EVM zkSend signs exactly `Privacy Money account sign in` and stores it in `localStorage` as `evm_sign_<address>`, which is what the EVM SDK uses to decrypt notes. A different message makes shielded funds undecryptable. The same signature is reused when the address switches among supported EVM mainnets.

Supported EVM mainnets, and only the pools privacycash-evm actually configures:

- Ethereum (chain 1): ETH and USDT (`0xdAC17F958D2ee523a2206206994597C13D831ec7`, 6 decimals). USDC has no pool.
- Base (chain 8453): ETH and USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`, 6 decimals).
- BNB Smart Chain (chain 56): BNB and USDT (`0x55d398326f99059fF775485246999027B3197955`, 18 decimals). The SDK token for native BNB is `bnb`, not `eth`.
- Robinhood Chain (chain 4663): ETH and USDG (`0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`, 6 decimals).

Testnets are rejected, including Robinhood testnet 46630. `WalletGuard` accepts an EVM wallet on `/zksend/` only when `allowEthereum` is set and the chain is one of those four mainnets. AppKit lists those four plus the existing Solana networks. The navbar and zkSend page show the selected network name. Withdrawals are relayed. The amount entered is deducted from the private balance, and the network fee plus protocol fee come out of that amount. MAX on a native shield leaves 0.005 of that native token for gas.

### Supported Tokens
- **SOL** - Native Solana
- **USDC** - `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` (Solana) and Base
- **USDT** - `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` (Solana), Ethereum (6 decimals), BNB Smart Chain (18 decimals)
- **ETH** - Ethereum, Base, and Robinhood Chain
- **BNB** - BNB Smart Chain
- **USDG** - Robinhood Chain

### SDK Wrapper
Located at `app/zksend/lib/privacy-cash-sdk.ts`:

```typescript
// Initialize with signature
await privacyCashSDK.initializeWithSignature(signature);
privacyCashSDK.setWalletAddress(address);
privacyCashSDK.setTransactionSigner(signTransaction);

// Operations
await privacyCashSDK.deposit(lamports);
await privacyCashSDK.withdraw(lamports, recipient);
await privacyCashSDK.getPrivateBalance();
```

### Required WASM Files
- `light_wasm_hasher_bg.wasm` - Hasher for ZK proofs (SISD)
- `hasher_wasm_simd_bg.wasm` - Hasher for ZK proofs (SIMD)
- `rektsafe.wasm` - Circuit for proof generation
- `rektsafe.zkey` - Proving key
- `public/circuit2.wasm` and `public/circuit2.zkey` - Ethereum proving artifacts copied from `privacycash-evm`

### Browser Polyfills

The SDK requires Node.js modules that need polyfills:

| Module | Polyfill Location |
|--------|-------------------|
| `path` | `lib/browser-polyfills/path.ts` |
| `node-localstorage` | `lib/browser-polyfills/node-localstorage.ts` |
| `web-worker` | `lib/browser-polyfills/web-worker.js` (browser `Worker`; avoids the Node dynamic `require`) |
| `bigint-buffer` | `lib/browser-polyfills/bigint-buffer.js` (pure JS, no native addon) |
| `fs`, `os`, etc. | `fallback: false` in webpack config |

### Key Components

| Component | Purpose |
|-----------|---------|
| `shield-section.tsx` | Deposit SOL into privacy pool |
| `send-section.tsx` | Send private transfers |
| `unshield-section.tsx` | Withdraw from privacy pool |
| `balance-card.tsx` | Display public/private balances |
| `history-section.tsx` | Transaction history |

---

Last updated: October 2026
