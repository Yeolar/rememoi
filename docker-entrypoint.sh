#!/bin/sh
# Seeds the SQLite volume from the database snapshot baked into the image.
#
# `next build` opens the database to prerender posts, so the image already
# contains a populated copy at /app/seed. On a fresh host the bind mount is
# empty; copying it in gives the same result the old `pnpm db:setup` entrypoint
# produced, without needing pnpm or tsx at runtime. Existing databases are never
# touched, and future schema changes are applied in place by `ensureSchema()`.
set -eu

work_dir="$(pwd)"
seed_db="$work_dir/seed/rememoi.db"
db_url="${DATABASE_URL:-file:./data/rememoi.db}"

case "$db_url" in
  file:*)
    db_path="${db_url#file:}"
    case "$db_path" in
      /*) ;;
      *) db_path="$work_dir/${db_path#./}" ;;
    esac
    if [ ! -f "$db_path" ] && [ -f "$seed_db" ]; then
      echo "[entrypoint] seeding $db_path from the image snapshot"
      mkdir -p "$(dirname "$db_path")"
      # Copy the database plus any -wal/-shm siblings SQLite left behind.
      for extra in "$seed_db"*; do
        [ -f "$extra" ] || continue
        cp "$extra" "${db_path}${extra#"$seed_db"}"
      done
    fi
    ;;
  *)
    # Remote libSQL/Turso: the app creates its own schema on first query.
    ;;
esac

exec "$@"
