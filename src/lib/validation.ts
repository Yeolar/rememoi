import { z } from 'zod'

import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages'

export const heroImageSchema = z.object({
  src: z.string().trim().min(1),
  alt: z.string().trim().max(200).optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  color: z.string().trim().max(40).optional()
})

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const languageField = z
  .string()
  .trim()
  .max(40)
  .nullable()
  .superRefine((value, ctx) => {
    if (value && !normalizeLanguage(value)) {
      ctx.addIssue({
        code: 'custom',
        message: `Unsupported language. Use one of: ${LANGUAGE_CODES.join(', ')}.`
      })
    }
  })

export const postInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(120)
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and single dashes'),
  description: z.string().trim().max(300).default(''),
  body: z.string().min(1, 'Content is required'),
  format: z.enum(['md', 'mdx']).default('mdx'),
  status: z.enum(['draft', 'published', 'private']).default('draft'),
  pinned: z.boolean().default(false),
  commentsEnabled: z.boolean().default(true),
  language: languageField.optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  heroImage: heroImageSchema.nullish(),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().nullish()
})

/**
 * PATCH schema: every field is optional and there are deliberately no
 * defaults, otherwise an omitted field would be reset to its default value.
 */
export const postUpdateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120).optional(),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(120)
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and single dashes')
    .optional(),
  description: z.string().trim().max(300).optional(),
  body: z.string().min(1, 'Content is required').optional(),
  format: z.enum(['md', 'mdx']).optional(),
  status: z.enum(['draft', 'published', 'private']).optional(),
  pinned: z.boolean().optional(),
  commentsEnabled: z.boolean().optional(),
  language: languageField.optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  heroImage: heroImageSchema.nullish(),
  publishDate: z.coerce.date().optional(),
  updatedDate: z.coerce.date().nullish()
})

export const previewInputSchema = z.object({
  body: z.string(),
  format: z.enum(['md', 'mdx']).default('mdx')
})

export type PostInput = z.infer<typeof postInputSchema>
export type PostUpdateInput = z.infer<typeof postUpdateSchema>

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message
  }))
}
