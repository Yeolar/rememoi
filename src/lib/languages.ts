/**
 * Canonical post languages. Posts store the BCP-47-ish code (`zh-CN`, `en`);
 * labels and Open Graph locales are derived from this table.
 *
 * Legacy free-text values such as `English` or `中文` are normalized on read and
 * during `pnpm db:setup`, so existing content keeps working.
 */
export const LANGUAGE_OPTIONS = [
  {
    code: 'zh-CN',
    label: '中文',
    ogLocale: 'zh_CN',
    aliases: ['zh', 'zh-cn', 'zh_cn', 'zh-hans', 'cn', 'chinese', '中文', '简体中文']
  },
  {
    code: 'en',
    label: 'English',
    ogLocale: 'en_US',
    aliases: ['en', 'en-us', 'en_us', 'en-gb', 'english', '英文']
  }
] as const

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code']

export const LANGUAGE_CODES = LANGUAGE_OPTIONS.map((option) => option.code)
export const LANGUAGE_LABELS = LANGUAGE_OPTIONS.map((option) => option.label)

const aliasToCode = new Map<string, LanguageCode>()
for (const option of LANGUAGE_OPTIONS) {
  aliasToCode.set(option.code.toLowerCase(), option.code)
  aliasToCode.set(option.label.toLowerCase(), option.code)
  for (const alias of option.aliases) aliasToCode.set(alias.toLowerCase(), option.code)
}

/** Returns a canonical language code, or null for empty/unsupported values. */
export function normalizeLanguage(value: unknown): LanguageCode | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null
  return aliasToCode.get(normalized) ?? null
}

/** Human-readable label. Unknown legacy values are shown as-is. */
export function getLanguageLabel(value: string | null | undefined) {
  if (!value) return ''
  const code = normalizeLanguage(value)
  if (!code) return value
  return LANGUAGE_OPTIONS.find((option) => option.code === code)?.label ?? code
}

export function getOpenGraphLocale(value: string | null | undefined) {
  const code = normalizeLanguage(value)
  if (!code) return undefined
  return LANGUAGE_OPTIONS.find((option) => option.code === code)?.ogLocale
}

export function getLanguageOption(value: string | null | undefined) {
  const code = normalizeLanguage(value)
  if (!code) return undefined
  return LANGUAGE_OPTIONS.find((option) => option.code === code)
}
