# AGENTS.md - rektSafe

> Project context and guidelines for AI agents working on rektSafe

## Project Overview

**rektSafe** is a decentralized dead man's switch application for crypto and data inheritance. It uses threshold signature schemes (TSS) to securely pass digital assets to beneficiaries.

- **Stack**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Crypto**: Web Crypto API (Ed25519, AES-256-GCM, SHA-256)
- **Theme**: Dark cypherpunk with neon accents
- **Architecture**: Client-side only, static export (no SSR)

## Directory Structure

```
rektsafe/
├── app/                    # Next.js App Router
│   ├── vault/             # Crypto vault (TSS app)
│   │   ├── page.tsx       # Vault page component
│   │   └── metadata.ts    # Page-specific metadata
│   ├── privacy/           # Privacy policy page
│   │   ├── page.tsx
│   │   └── metadata.ts
│   ├── terms/             # Terms of service page
│   │   ├── page.tsx
│   │   └── metadata.ts
│   ├── globals.css        # Cypherpunk theme variables
│   ├── layout.tsx         # Root layout with navbar/footer
│   ├── page.tsx           # Landing page
│   └── metadata.ts        # Shared metadata configs
├── components/            # React components
│   ├── navbar.tsx         # Navigation with glitch effects
│   ├── footer.tsx         # Minimal footer
│   ├── hero.tsx           # Animated hero section
│   ├── features.tsx       # Feature cards
│   ├── how-it-works.tsx   # Process steps
│   ├── tech-stack.tsx     # Technology showcase
│   ├── cta.tsx            # Call to action
│   ├── wallet-provider.tsx # Wallet connection provider
│   ├── wallet-guard.tsx    # Wallet auth guard for vault
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
│   └── use-sns-name.ts    # SNS domain resolution
├── lib/
│   └── utils.ts           # Utility functions (cn, etc.)
├── public/                # Static assets
│   ├── favicon.svg        # Main favicon
│   ├── favicon-32x32.svg  # Small favicon
│   ├── apple-touch-icon.svg # Apple touch icon
│   ├── og-image.svg       # Open Graph image
│   ├── site.webmanifest   # PWA manifest
│   ├── robots.txt         # SEO robots
│   └── sitemap.xml        # SEO sitemap
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
| `/vault/` | Crypto vault - TSS app |
| `/privacy/` | Privacy policy |
| `/terms/` | Terms of service |

## Build Output

Static files are generated in `/dist/`:
- `index.html` - Home page
- `vault/index.html` - Crypto vault
- `privacy/index.html` - Privacy page
- `terms/index.html` - Terms page
- `_next/` - JS/CSS assets

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

## Security Considerations

- All crypto happens client-side via Web Crypto API
- No keys or data sent to servers
- Users responsible for key management
- Uses standard, audited algorithms only

## Wallet Integration

Reown AppKit (formerly WalletConnect) is integrated for Solana wallet connections.

### Supported Wallets
- Phantom (browser extension)
- Solflare (browser extension)
- Other wallets via WalletConnect QR

### Environment Variables

```bash
# Required: Get from https://cloud.reown.com
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id

# Optional: Custom Solana RPC endpoint
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
```

For production deployment, set `NEXT_PUBLIC_REOWN_PROJECT_ID` in GitHub repository secrets. See `.env.example` for reference.

### Vault Access Control

The `/vault/` route is protected by `WalletGuard` component:
- Users must connect a Solana wallet before accessing vault features
- Wallet address is displayed in the navbar when connected
- Direct browser extension connection (no QR code modal for installed wallets)
- Shows "Install" button if wallet extension is not detected
- **SNS Support**: If wallet has a .sol domain, it displays the domain name instead of address

### Components

| Component | Purpose |
|-----------|---------|
| `wallet-provider.tsx` | Initializes AppKit with Solana adapter |
| `wallet-guard.tsx` | Blocks vault access until wallet connected |

### Hooks

| Hook | Purpose |
|------|---------|
| `useSnsName(address)` | Resolves wallet address to SNS (.sol) domain name |
| `useAppKitWallet` | Direct wallet connection from `@reown/appkit-wallet-button/react` |

### Wallet Connection Implementation

The wallet connection uses `useAppKitWallet` hook:
- Single hook instance handles all wallet connections
- Detects wallet installation via `window.phantom` and `window.solflare`
- Direct connection to browser extensions without modal
- Falls back to WalletConnect QR code for "Other Wallets" option

### Usage in Components

```tsx
import { useAppKitAccount } from "@reown/appkit/react";
import { useSnsName } from "@/hooks/use-sns-name";

function MyComponent() {
  const { isConnected, address } = useAppKitAccount();
  const { snsName, isLoading } = useSnsName(address);
  
  if (isConnected) {
    return <div>Connected: {snsName || address}</div>;
  }
  
  return <Button>Connect Wallet</Button>;
}
```

---

Last updated: January 2026
