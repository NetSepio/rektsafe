# AGENTS.md - rektSafe

> Project context and guidelines for AI agents working on rektSafe

## Project Overview

**rektSafe** is a decentralized dead man's switch application for crypto and data inheritance. It uses threshold signature schemes (TSS) to securely pass digital assets to beneficiaries, and now includes private transfers via zkSend.

- **Stack**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Crypto**: Web Crypto API (Ed25519, AES-256-GCM, SHA-256), Privacy Cash SDK
- **Theme**: Dark cypherpunk with neon accents
- **Architecture**: Client-side only, static export (no SSR)

## Directory Structure

```
rektsafe/
├── app/                    # Next.js App Router
│   ├── zksig/             # zkSig - Threshold signatures (TSS/DMS)
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
| Framework | Next.js 15 (App Router) |
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
| `/zksig/` | zkSig - Threshold signatures (TSS/DMS) |
| `/zksend/` | Private transfers - zkSend app |
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
- `privacy/index.html` - Privacy page
- `terms/index.html` - Terms page
- `_next/` - JS/CSS assets
- `wasm/` - WASM files for ZK proofs

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

- All crypto happens client-side via Web Crypto API
- No keys or data sent to servers
- Users responsible for key management
- Uses standard, audited algorithms only
- Privacy Cash SDK for ZK-based privacy

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

**Signing Message:**
```
Welcome to RektSafe. For Cypherpunks, By Cypherpunks
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

## Privacy Cash SDK Integration

### Overview
The app integrates `privacycash` SDK for private transactions on Solana.

### Supported Tokens
- **SOL** - Native Solana
- **USDC** - `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **USDT** - `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`

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

### Browser Polyfills

The SDK requires Node.js modules that need polyfills:

| Module | Polyfill Location |
|--------|-------------------|
| `path` | `lib/browser-polyfills/path.ts` |
| `node-localstorage` | `lib/browser-polyfills/node-localstorage.ts` |
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

Last updated: February 2026
