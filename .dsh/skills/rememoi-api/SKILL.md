---
name: rememoi-api
description: List, read, create, and update Rememoi blog posts through the HTTP API. Reads are public; writes require an admin session or a REMEMOI_API_TOKEN bearer token.
whenToUse: Use when the user asks to inspect, draft, publish, create, or edit a post on the Rememoi blog, or to automate post management through its API.
---

# Rememoi API

This skill wraps the Rememoi blog post API. It works against a running Rememoi
site (default `http://localhost:3000`) and uses the bundled CLI at
`scripts/rememoi.mjs` — the file next to this `SKILL.md`.

## Configure

The CLI reads two environment variables:

```bash
export REMEMOI_BASE_URL=http://localhost:3000   # optional, this is the default
export REMEMOI_API_TOKEN=<the server's REMEMOI_API_TOKEN>
```

- `REMEMOI_API_TOKEN` is required for **create**, **update**, **upload**,
  **draft reads**, and `list --all`.
- Reads of published posts need no token.
- The token must match the server environment. Add it to the site's
  `.env.local` and restart the server if it is missing:

```dotenv
REMEMOI_API_TOKEN=a-long-random-value
```

Never print, log, or commit the token. If it is not available, ask the user to
set it; do not attempt to read `.env.local` unless the user asks you to.

## Run the CLI

Resolve the CLI against this skill's base directory (the skill loader reports
it). For example:

```bash
SKILL_DIR=/path/to/rememoi-api
node "$SKILL_DIR/scripts/rememoi.mjs" list --limit 5
```

If you are working in the Rememoi repository itself, the path is:

```bash
node .dsh/skills/rememoi-api/scripts/rememoi.mjs list --limit 5
```

### List posts

```bash
node "$SKILL_DIR/scripts/rememoi.mjs" list
node "$SKILL_DIR/scripts/rememoi.mjs" list --tag design --limit 20
node "$SKILL_DIR/scripts/rememoi.mjs" list --language zh-CN
node "$SKILL_DIR/scripts/rememoi.mjs" list --all                 # includes drafts, needs token
```

### Read a post

```bash
node "$SKILL_DIR/scripts/rememoi.mjs" get hello-rememoi
node "$SKILL_DIR/scripts/rememoi.mjs" get draft-notes --draft    # draft, needs token
```

### Create a post

Write a JSON file, then create it. `publishDate` defaults to now if omitted;
`slug` is generated from the title if omitted. The API defaults to
`status: "draft"` and `format: "mdx"`, so set those explicitly when needed.

```bash
cat > /tmp/rememoi-post.json <<'JSON'
{
  "title": "A new note",
  "slug": "a-new-note",
  "description": "One or two sentences for previews.",
  "body": "## Hello\n\nMarkdown or MDX content.",
  "format": "mdx",
  "status": "draft",
  "tags": ["notes"],
  "language": "en",
  "pinned": false,
  "commentsEnabled": true,
  "publishDate": "2026-11-07T12:00:00.000Z"
}
JSON

node "$SKILL_DIR/scripts/rememoi.mjs" create --file /tmp/rememoi-post.json
```

The response includes `data.id`, `data.slug`, and `data.status`. Report those
to the user.

### Update a post

`PATCH` is partial: send only the fields that should change. Do not send the
whole object unless every field should be replaced.

```bash
cat > /tmp/rememoi-patch.json <<'JSON'
{
  "status": "published",
  "description": "An updated description."
}
JSON

node "$SKILL_DIR/scripts/rememoi.mjs" update a-new-note --file /tmp/rememoi-patch.json
```

The post slug can be changed with `{"slug": "new-slug"}`; the old URL stops
working, so confirm with the user before doing this.

### Upload a cover or inline image

```bash
node "$SKILL_DIR/scripts/rememoi.mjs" upload ./cover.jpg
```

The response contains `data.url`, `data.storage`, `data.width`, and
`data.height`. `url` is `/api/media/<id>` when images are stored in the database,
or a COS/CDN URL when `MEDIA_DRIVER=cos`. Use the returned URL directly in a post
payload:

```json
{ "heroImage": { "src": "<data.url>", "width": 1600, "height": 1000 } }
```

For inline images, insert `![alt](/api/media/<id>)` into the body.

## Raw endpoints

Use these if the CLI is unavailable.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/posts?tag=&language=&page=&limit=` | public | Published post list |
| `GET` | `/api/posts/<slug>` | public | Published post detail |
| `POST` | `/api/posts` | write | Create a post |
| `PATCH` | `/api/posts/<slug>` | write | Partially update a post |
| `GET` | `/api/admin/posts` | write | All posts incl. drafts (summaries) |
| `GET` | `/api/admin/posts/<id>` | write | Full post incl. body |
| `PATCH` | `/api/admin/posts/<id>` | write | Update by id |
| `DELETE` | `/api/admin/posts/<id>` | write | Delete by id (ask first) |
| `POST` | `/api/admin/upload` | write | Multipart image upload; returns `/api/media/<id>` or a COS/CDN URL |

Write auth is either:

```http
Authorization: Bearer <REMEMOI_API_TOKEN>
```

or an Auth.js admin session cookie. Prefer the bearer token in automation.

## Rules

- Default new posts to `status: "draft"`; publish only when the user asks.
- Use canonical `language` codes: `zh-CN` (中文) or `en` (English). The server also accepts legacy aliases such as `English` / `中文`, but prefer the codes.
- Always include a meaningful `title`, `description`, and `slug`.
- Validate before writing: a `422` response contains `issues` with the exact
  fields to fix.
- After a write, verify with `get` (or `get --draft`) and report the slug, id,
  status, and URL.
- Ask before deleting a post, renaming a published post's slug, or publishing
  unfinished content.
- Do not invent media URLs. Upload local files first, then reference the
  returned `/api/media/<id>` URL.
- Never put the API token in post content, JSON files, or committed config.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `401 unauthorized` | Token missing/wrong, or the admin session expired. |
| `503 auth_not_configured` | Server has no `AUTH_SECRET` and no `REMEMOI_API_TOKEN`; set the token on the server and restart. |
| `422 validation_error` | Read the `issues` array; fix required fields or the slug format. |
| `404 not_found` | Check the slug; drafts are only visible with `--draft` and a token. |
| `ECONNREFUSED` | The site is not running at `REMEMOI_BASE_URL`. |
