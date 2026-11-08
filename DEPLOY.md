# Deploying Rememoi

This deployment uses:

- **Caddy on the host** for TLS and reverse proxying.
- **Rememoi in Docker** on `127.0.0.1:3000`.
- **SQLite** on a host bind mount at `./data`.
- **COS** for media, proxied by the application.

```text
Internet
  │ 80/443
  ▼
Caddy (host)
  │ http://127.0.0.1:3000
  ▼
Rememoi container
  ├── ./data/rememoi.db
  └── private COS (GetObject proxy)
```

## 1. DNS

At Namecheap Advanced DNS:

| Type | Host | Value |
| --- | --- | --- |
| A | `@` | Lighthouse/server public IPv4 |
| CNAME | `www` | `rememoi.com` |

Open TCP 80, TCP 443 and UDP 443 in the Lighthouse firewall.

## 2. Production environment

Copy `.env.production` to the server and fill in:

- `AUTH_SECRET`
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`
- `ADMIN_GITHUB_LOGINS`
- `COS_SECRET_ID` / `COS_SECRET_KEY`
- `COS_BUCKET` / `COS_REGION`
- `DATABASE_URL` if not using the local file
- `REMEMOI_API_TOKEN`

Keep the file private:

```bash
chmod 600 .env.production
```

## 3. Persistent database

Create the data directory:

```bash
mkdir -p data
```

If you have an existing local database, copy it:

```bash
cp /path/to/rememoi.db ./data/rememoi.db
```

On an empty volume the container runs `pnpm db:setup` before starting and seeds from `content/memory`.

## 4. Start the app container

```bash
docker compose build
docker compose up -d
docker compose logs -f rememoi
```

The app is intentionally bound only to loopback:

```text
127.0.0.1:3000
```

It is not directly reachable from the internet.

## 5. Install Caddy on the host

On Debian/Ubuntu, use the official Caddy repository:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

## 6. Configure Caddy

Back up the default config and install the project Caddyfile:

```bash
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.original
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Check the certificate issuance:

```bash
sudo journalctl -u caddy -f
```

Caddy will obtain and renew certificates automatically for `rememoi.com` and `www.rememoi.com`.

## 7. Verify

```bash
curl -I https://rememoi.com
curl -I https://www.rememoi.com
curl -I http://127.0.0.1:3000/
```

Expected:

- `https://rememoi.com` → `200`
- `https://www.rememoi.com` → redirect to the apex domain
- Direct port 3000 only works locally

## 8. Update

```bash
git pull
docker compose build
docker compose up -d
```

Caddy does not need to be restarted for application changes.

## 9. Backups

The database is the host file `data/rememoi.db`:

```bash
sqlite3 data/rememoi.db \
  ".backup 'backups/rememoi-$(date +%Y%m%d-%H%M%S).db'"
```

Back up `.env.production` separately and securely.

## Notes

- Caddy is **not** part of `docker-compose.yml`; it runs as a host service.
- `NEXT_PUBLIC_SITE_URL` is baked into the image; rebuild if the domain changes.
- The container uses `COS` through the app proxy, so no public COS bucket or image CDN is required.
- If the app is not starting, check `docker compose logs rememoi`.
- If Caddy cannot issue a certificate, check DNS and ports 80/443.
