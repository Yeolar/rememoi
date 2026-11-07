#!/usr/bin/env node
/**
 * Rememoi post API CLI.
 *
 *   node rememoi.mjs list [--tag design] [--language zh-CN] [--page 1] [--limit 10] [--all]
 *   node rememoi.mjs get <slug> [--draft]
 *   node rememoi.mjs create --file post.json
 *   node rememoi.mjs update <slug> --file patch.json
 *   node rememoi.mjs upload <image>
 *
 * Configuration:
 *   REMEMOI_BASE_URL   default http://localhost:3000
 *   REMEMOI_API_TOKEN  required for create/update/upload and --all
 */

import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const command = args[0]
const rest = args.slice(1)

const flags = {}
const positional = []

for (let index = 0; index < rest.length; index += 1) {
  const value = rest[index]
  if (value === '--') {
    positional.push(...rest.slice(index + 1))
    break
  }
  if (value.startsWith('--')) {
    const [key, inline] = value.slice(2).split('=')
    if (inline !== undefined) {
      flags[key] = inline
    } else if (rest[index + 1] !== undefined && !rest[index + 1].startsWith('--')) {
      flags[key] = rest[index + 1]
      index += 1
    } else {
      flags[key] = true
    }
  } else {
    positional.push(value)
  }
}

const BASE = (flags.base || process.env.REMEMOI_BASE_URL || 'http://localhost:3000').replace(
  /\/+$/,
  ''
)
const TOKEN = process.env.REMEMOI_API_TOKEN || ''

function fail(message, details) {
  console.error(`Error: ${message}`)
  if (details !== undefined) console.error(JSON.stringify(details, null, 2))
  process.exit(1)
}

function usage() {
  console.log(`Rememoi post API CLI

Usage:
  node rememoi.mjs list [--tag <tag>] [--language <zh-CN|en>] [--page <n>] [--limit <n>] [--all]
  node rememoi.mjs get <slug> [--draft]
  node rememoi.mjs create --file <post.json>
  node rememoi.mjs update <slug> --file <patch.json>
  node rememoi.mjs upload <image>

Options:
  --base <url>        override REMEMOI_BASE_URL
  --tag <tag>         filter the list by tag
  --language <code>   filter the list by language (zh-CN or en)
  --page <n>          page number for the public list
  --limit <n>         page size for the public list
  --all               list all posts including drafts (requires REMEMOI_API_TOKEN)
  --draft             get a draft by slug (requires REMEMOI_API_TOKEN)

Environment:
  REMEMOI_BASE_URL   site URL, default http://localhost:3000
  REMEMOI_API_TOKEN  write token, must match the server environment
`)
}

function requireToken(action) {
  if (!TOKEN) {
    fail(
      `REMEMOI_API_TOKEN is required to ${action}.`,
      'Set it to the same value as the server .env.local and make sure the server was restarted.'
    )
  }
}

function readJsonFile(filePath) {
  if (!filePath || filePath === true) fail('Provide a JSON file with --file <path>.')
  let raw
  try {
    raw = fs.readFileSync(path.resolve(String(filePath)), 'utf8')
  } catch (error) {
    fail(`Cannot read ${filePath}: ${error.message}`)
  }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      fail('The JSON payload must be an object.')
    }
    return parsed
  } catch (error) {
    fail(`Invalid JSON in ${filePath}: ${error.message}`)
  }
}

function encodeSlug(slug) {
  return String(slug)
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

async function request(method, route, options = {}) {
  const { auth = false, body, form } = options
  if (auth) requireToken('write to the API')

  const headers = {}
  if (auth) headers.Authorization = `Bearer ${TOKEN}`

  let payload
  if (form) {
    payload = form
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${BASE}${route}`, { method, headers, body: payload })
  } catch (error) {
    fail(`Could not reach ${BASE}: ${error.message}`)
  }

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      `HTTP ${response.status} ${response.statusText}`
    fail(`HTTP ${response.status}: ${message}`, data)
  }

  return data
}

async function list() {
  if (flags.all) {
    requireToken('list drafts')
    const result = await request('GET', '/api/admin/posts', { auth: true })
    let data = result?.data ?? []
    if (flags.tag) {
      const tag = String(flags.tag).toLowerCase()
      data = data.filter((post) => Array.isArray(post.tags) && post.tags.includes(tag))
    }
    if (flags.language) {
      const language = String(flags.language)
      data = data.filter((post) => post.language === language)
    }
    console.log(JSON.stringify({ data, meta: { total: data.length, all: true } }, null, 2))
    return
  }

  const params = new URLSearchParams()
  if (flags.tag) params.set('tag', String(flags.tag))
  if (flags.language) params.set('language', String(flags.language))
  if (flags.page) params.set('page', String(flags.page))
  if (flags.limit) params.set('limit', String(flags.limit))
  const query = params.toString()
  const result = await request('GET', `/api/posts${query ? `?${query}` : ''}`)
  console.log(JSON.stringify(result, null, 2))
}

async function get() {
  const slug = positional[0]
  if (!slug) fail('Provide a post slug: node rememoi.mjs get <slug>')

  if (flags.draft || flags.all) {
    requireToken('read drafts')
    const result = await request('GET', '/api/admin/posts', { auth: true })
    const summary = (result?.data ?? []).find((item) => item.slug === slug)
    if (!summary) fail(`No post with slug "${slug}".`)
    const full = await request('GET', `/api/admin/posts/${summary.id}`, { auth: true })
    console.log(JSON.stringify(full, null, 2))
    return
  }

  const result = await request('GET', `/api/posts/${encodeSlug(slug)}`)
  console.log(JSON.stringify(result, null, 2))
}

async function create() {
  const payload = readJsonFile(flags.file)
  if (!payload.slug && payload.title) {
    payload.slug = slugify(payload.title) || `post-${Date.now().toString(36)}`
  }
  if (!payload.publishDate) payload.publishDate = new Date().toISOString()
  const result = await request('POST', '/api/posts', { auth: true, body: payload })
  console.log(JSON.stringify(result, null, 2))
}

async function update() {
  const slug = positional[0]
  if (!slug) fail('Provide the current post slug: node rememoi.mjs update <slug> --file patch.json')
  const payload = readJsonFile(flags.file)
  const result = await request('PATCH', `/api/posts/${encodeSlug(slug)}`, {
    auth: true,
    body: payload
  })
  console.log(JSON.stringify(result, null, 2))
}

const MIME_BY_EXTENSION = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif'
}

async function upload() {
  const filePath = positional[0]
  if (!filePath) fail('Provide an image path: node rememoi.mjs upload <image>')
  const absolute = path.resolve(filePath)
  const extension = path.extname(absolute).toLowerCase()
  const mime = MIME_BY_EXTENSION[extension]
  if (!mime) fail(`Unsupported image type "${extension || 'unknown'}".`)

  let bytes
  try {
    bytes = fs.readFileSync(absolute)
  } catch (error) {
    fail(`Cannot read ${filePath}: ${error.message}`)
  }

  const form = new FormData()
  form.append('file', new Blob([bytes], { type: mime }), path.basename(absolute))
  const result = await request('POST', '/api/admin/upload', { auth: true, form })
  console.log(JSON.stringify(result, null, 2))
}

async function main() {
  switch (command) {
    case 'list':
      await list()
      break
    case 'get':
      await get()
      break
    case 'create':
      await create()
      break
    case 'update':
      await update()
      break
    case 'upload':
      await upload()
      break
    case undefined:
    case 'help':
    case '--help':
    case '-h':
      usage()
      break
    default:
      fail(`Unknown command "${command}".`)
  }
}

main().catch((error) => fail(error.message))
