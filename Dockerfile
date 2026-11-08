# syntax=docker/dockerfile:1

# --- deps: full install, devDependencies included (needed by `next build`) ---
FROM node:22-bookworm-slim AS deps
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- builder: produce the self-contained standalone server ---
FROM deps AS builder
COPY . .

# NEXT_PUBLIC_* values are baked into the build.
ARG NEXT_PUBLIC_SITE_URL=https://rememoi.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# `pnpm build` seeds SQLite from content/memory first: `next build` prerenders
# the post and tag routes from that database, so the order matters.
RUN pnpm build

# --- runner: standalone output only — no pnpm, no devDependencies ---
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# Cap the V8 heap. Without it Node sizes the heap off total RAM, so a runaway
# allocation pushes the whole host into reclaim and the kernel's OOM killer picks
# whichever process is biggest — often sshd or dockerd, i.e. the machine "hangs"
# instead of one container restarting. docker-compose.yml raises this to match
# mem_limit; keep heap <= ~2/3 of that limit for off-heap (sharp, SQLite, sockets).
ENV NODE_OPTIONS="--max-old-space-size=512"

WORKDIR /app

# server.js + traced node_modules, then the assets Next leaves out of standalone.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Snapshot of the database created during the build, used to seed an empty volume.
COPY --from=builder /app/data ./seed

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && mkdir -p /app/data

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
