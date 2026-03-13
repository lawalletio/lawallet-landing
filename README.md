# LaWallet Landing

Landing page for [LaWallet](https://docs.lawallet.io) — Lightning addresses and Nostr identity for your community.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

### Environment variables

| Variable | Description |
|---|---|
| `PRIVATE_KEY` | Nostr private key (hex) for signing waitlist events |
| `RELAY_URLS` | Comma-separated relay URLs (defaults to damus, nos.lol, nostr.band) |

## Related repositories

- [lawallet-nwc](https://github.com/lawalletio/lawallet-nwc) — NWC proxy and Lightning address server
- [docs](https://github.com/lawalletio/docs) — Documentation ([docs.lawallet.io](https://docs.lawallet.io))
- [pos](https://github.com/lawalletio/pos) — Point of Sale
