'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { DeletePostButton } from '@/components/admin/DeletePostButton'
import { Icon } from '@/components/icons/Icon'
import { LANGUAGE_OPTIONS } from '@/lib/languages'
import { fallbackSlug, slugify } from '@/lib/slug'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import type { AdminPostDTO, PostImage, PostStatus } from '@/types'

type PostEditorProps = {
  mode: 'create' | 'edit'
  post?: AdminPostDTO
}

type UploadResult = {
  url: string
  width?: number
  height?: number
}

type Message = {
  type: 'error' | 'success'
  text: string
}

function localToday() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function toDateInput(iso: string) {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function PostEditor({ mode, post }: PostEditorProps) {
  const router = useRouter()
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const heroFileRef = useRef<HTMLInputElement>(null)
  const inlineFileRef = useRef<HTMLInputElement>(null)

  const [postId, setPostId] = useState<string | null>(post?.id ?? null)
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [description, setDescription] = useState(post?.description ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [format, setFormat] = useState<'md' | 'mdx'>(post?.format ?? 'mdx')
  const [status, setStatus] = useState<PostStatus>(post?.status ?? 'draft')
  const [pinned, setPinned] = useState(post?.pinned ?? false)
  const [commentsEnabled, setCommentsEnabled] = useState(post?.commentsEnabled ?? true)
  const [language, setLanguage] = useState(post?.language ?? '')
  const [tagsInput, setTagsInput] = useState(post?.tags.join(', ') ?? '')
  const [publishDate, setPublishDate] = useState(
    post ? toDateInput(post.publishDate) : localToday()
  )
  const [heroImage, setHeroImage] = useState<PostImage | null>(post?.heroImage ?? null)
  const [saving, setSaving] = useState<PostStatus | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  const previewHref = postId ? `/preview/${postId}` : null

  const updateTitle = (value: string) => {
    setTitle(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  const insertAtCursor = (text: string) => {
    const element = bodyRef.current
    const start = element?.selectionStart ?? body.length
    const end = element?.selectionEnd ?? body.length
    const next = `${body.slice(0, start)}${text}${body.slice(end)}`
    setBody(next)
    window.requestAnimationFrame(() => {
      if (!element) return
      element.focus()
      const position = start + text.length
      element.setSelectionRange(position, position)
    })
  }

  const wrapSelection = (before: string, after = before, placeholder = 'text') => {
    const element = bodyRef.current
    const start = element?.selectionStart ?? body.length
    const end = element?.selectionEnd ?? body.length
    const selected = body.slice(start, end) || placeholder
    const next = `${body.slice(0, start)}${before}${selected}${after}${body.slice(end)}`
    setBody(next)
    window.requestAnimationFrame(() => {
      if (!element) return
      element.focus()
      element.setSelectionRange(start + before.length, start + before.length + selected.length)
    })
  }

  const uploadFile = async (file: File): Promise<UploadResult> => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Upload failed')
      }
      return data.data as UploadResult
    } finally {
      setUploading(false)
    }
  }

  const onHeroFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const uploaded = await uploadFile(file)
      setHeroImage((previous) => ({
        src: uploaded.url,
        width: uploaded.width,
        height: uploaded.height,
        alt: previous?.alt || title,
        color: previous?.color
      }))
      showToast({ message: 'Cover image uploaded.' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Upload failed' })
    }
  }

  const onInlineFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const uploaded = await uploadFile(file)
      insertAtCursor(`\n![${file.name.replace(/\.[^.]+$/, '')}](${uploaded.url})\n`)
      showToast({ message: 'Image inserted into the post.' })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Upload failed' })
    }
  }

  const save = async (targetStatus: PostStatus) => {
    setMessage(null)
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'A title is required before saving.' })
      return
    }
    if (!body.trim()) {
      setMessage({ type: 'error', text: 'The post body cannot be empty.' })
      return
    }

    const finalSlug = (slug.trim() || slugify(title) || fallbackSlug()).toLowerCase()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) {
      setMessage({
        type: 'error',
        text: 'Slug may only contain lowercase letters, numbers and single dashes.'
      })
      return
    }

    const tags = tagsInput
      .split(/[,，]/)
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      description: description.trim(),
      body,
      format,
      status: targetStatus,
      pinned,
      commentsEnabled,
      language: language.trim() || null,
      tags,
      heroImage,
      publishDate: new Date(`${publishDate}T12:00:00`).toISOString(),
      updatedDate: postId ? new Date().toISOString() : null
    }

    setSaving(targetStatus)
    try {
      const response = await fetch(postId ? `/api/admin/posts/${postId}` : '/api/admin/posts', {
        method: postId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const issues = Array.isArray(data.issues)
          ? data.issues.map((issue: { path: string; message: string }) => `${issue.path}: ${issue.message}`)
          : []
        throw new Error(issues.length > 0 ? issues.join('\n') : data.message || data.error || 'Save failed')
      }

      const saved = data.data as AdminPostDTO
      const created = !postId
      setPostId(saved.id)
      setSlug(saved.slug)
      setStatus(saved.status)
      const savedLabel =
        saved.status === 'published'
          ? 'Published'
          : saved.status === 'private'
            ? 'Marked private'
            : 'Draft saved'
      setMessage({ type: 'success', text: `${savedLabel} successfully.` })
      showToast({ message: `${savedLabel}.` })
      if (created) router.replace(`/admin/posts/${saved.id}`)
      router.refresh()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Save failed.'
      })
    } finally {
      setSaving(null)
    }
  }

  const busy = saving !== null || uploading

  return (
    <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]'>
      <div className='flex min-w-0 flex-col gap-5'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div className='min-w-0'>
            <p className='text-xs uppercase tracking-wider text-muted-foreground'>
              {mode === 'create' ? 'New post' : 'Edit post'}
            </p>
            <h1 className='truncate text-2xl font-medium'>{title.trim() || 'Untitled'}</h1>
          </div>
          <span
            className={cn(
              'rounded-full border px-3 py-1 text-xs',
              status === 'published'
                ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300'
                : status === 'private'
                  ? 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
            )}
          >
            {status}
          </span>
        </div>

        {message && (
          <div
            className={cn(
              'whitespace-pre-line rounded-xl border px-4 py-3 text-sm',
              message.type === 'error'
                ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
                : 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300'
            )}
            role={message.type === 'error' ? 'alert' : 'status'}
          >
            {message.text}
          </div>
        )}

        <label className='field'>
          <span className='field-label'>Title</span>
          <input
            className='field-input text-lg font-medium'
            value={title}
            onChange={(event) => updateTitle(event.target.value)}
            placeholder='A title worth remembering'
          />
        </label>

        <div className='field'>
          <span className='field-label'>Slug</span>
          <div className='flex items-stretch overflow-hidden rounded-lg border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10'>
            <span className='flex items-center border-r bg-muted px-3 text-sm text-muted-foreground'>
              /blog/
            </span>
            <input
              className='w-full bg-transparent px-3 py-2 text-sm outline-none'
              value={slug}
              onChange={(event) => {
                setSlugTouched(true)
                setSlug(event.target.value)
              }}
              placeholder='my-post-slug'
            />
          </div>
        </div>

        <label className='field'>
          <span className='field-label'>Description</span>
          <textarea
            className='field-input'
            rows={2}
            maxLength={300}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder='One or two sentences that appear in previews and search results.'
          />
          <span className='text-xs text-muted-foreground'>{description.length}/300</span>
        </label>

        <div className='overflow-hidden rounded-2xl border bg-background'>
          <div className='flex flex-wrap items-center gap-1 border-b bg-muted/40 px-2 py-1.5'>
            <button
              type='button'
              onClick={() => insertAtCursor('\n## Heading\n')}
              className='cursor-pointer rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground'
            >
              H2
            </button>
            <button
              type='button'
              onClick={() => wrapSelection('**')}
              className='cursor-pointer rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground'
            >
              B
            </button>
            <button
              type='button'
              onClick={() => wrapSelection('_')}
              className='cursor-pointer rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground'
            >
              I
            </button>
            <button
              type='button'
              onClick={() => wrapSelection('`')}
              className='cursor-pointer rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground'
            >
              Code
            </button>
            <button
              type='button'
              onClick={() => wrapSelection('[', '](https://)', 'link text')}
              className='cursor-pointer rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground'
            >
              Link
            </button>
            <button
              type='button'
              onClick={() => insertAtCursor('\n```ts\n\n```\n')}
              className='cursor-pointer rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground'
            >
              Code block
            </button>
            <button
              type='button'
              onClick={() => inlineFileRef.current?.click()}
              disabled={uploading}
              className='flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Icon name='qrcode' className='size-3.5 rotate-90' />
              Image
            </button>
            <input
              id='inline-image-input'
              ref={inlineFileRef}
              type='file'
              accept='image/png,image/jpeg,image/webp,image/gif,image/avif'
              className='hidden'
              onChange={onInlineFile}
            />
            <span className='ms-auto pr-1 text-xs text-muted-foreground'>
              {format === 'mdx' ? 'MDX' : 'Markdown'}
            </span>
          </div>
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={24}
            className='min-h-[480px] w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-7 outline-none'
            placeholder='Write in Markdown or MDX…'
            spellCheck
          />
          <div className='flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-xs text-muted-foreground'>
            <span>
              {body.length} characters · {body.split('\n').length} lines
            </span>
            <span>MDX components: Aside, Collapse, Tabs, Steps, Spoiler, Timeline, Button, Card</span>
          </div>
        </div>
      </div>

      <aside className='flex flex-col gap-5'>
        <section className='rounded-2xl border bg-background p-4'>
          <h2 className='mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground'>
            Publish
          </h2>
          <div className='flex flex-col gap-2'>
            <button
              type='button'
              onClick={() => save('published')}
              disabled={busy}
              className='flex cursor-pointer items-center justify-center gap-2 rounded-lg border bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {saving === 'published' ? 'Saving…' : status === 'published' ? 'Update' : 'Publish'}
            </button>
            <button
              type='button'
              onClick={() => save('draft')}
              disabled={busy}
              className='cursor-pointer rounded-lg border bg-muted px-4 py-2 text-sm transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-50'
            >
              {saving === 'draft' ? 'Saving…' : status === 'published' ? 'Unpublish' : 'Save draft'}
            </button>
            <button
              type='button'
              onClick={() => save('private')}
              disabled={busy}
              className='cursor-pointer rounded-lg border bg-muted px-4 py-2 text-sm transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-50'
            >
              {saving === 'private' ? 'Saving…' : status === 'private' ? 'Private' : 'Make private'}
            </button>
            <p className='text-xs text-muted-foreground'>
              Private posts are hidden from the public site and feeds.
            </p>
            {previewHref ? (
              <Link
                href={previewHref}
                target='_blank'
                className='text-center text-sm text-muted-foreground underline-offset-4 hover:underline'
              >
                Open preview ↗
              </Link>
            ) : (
              <span className='text-center text-xs text-muted-foreground'>
                Save first to preview the post.
              </span>
            )}
            {status === 'published' && postId && (
              <Link
                href={`/blog/${slug}`}
                target='_blank'
                className='text-center text-sm text-muted-foreground underline-offset-4 hover:underline'
              >
                View live ↗
              </Link>
            )}
          </div>
        </section>

        <section className='space-y-3 rounded-2xl border bg-background p-4'>
          <h2 className='text-sm font-medium uppercase tracking-wide text-muted-foreground'>
            Details
          </h2>
          <label className='field'>
            <span className='field-label'>Publish date</span>
            <input
              type='date'
              className='field-input'
              value={publishDate}
              onChange={(event) => setPublishDate(event.target.value)}
            />
          </label>
          <label className='field'>
            <span className='field-label'>Format</span>
            <select
              className='field-input'
              value={format}
              onChange={(event) => setFormat(event.target.value as 'md' | 'mdx')}
            >
              <option value='mdx'>MDX — Markdown + components</option>
              <option value='md'>Markdown</option>
            </select>
          </label>
          <label className='field'>
            <span className='field-label'>Tags</span>
            <input
              className='field-input'
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder='design, nextjs, notes'
            />
            <span className='text-xs text-muted-foreground'>Comma separated, lowercased.</span>
          </label>
          <label className='field'>
            <span className='field-label'>Language</span>
            <select
              className='field-input'
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value=''>Unspecified</option>
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label} ({option.code})
                </option>
              ))}
            </select>
            <span className='text-xs text-muted-foreground'>
              Used for the language badge and filters.
            </span>
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={pinned}
              onChange={(event) => setPinned(event.target.checked)}
            />
            Pin to the top of the blog
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={commentsEnabled}
              onChange={(event) => setCommentsEnabled(event.target.checked)}
            />
            Enable comments
          </label>
        </section>

        <section className='space-y-3 rounded-2xl border bg-background p-4'>
          <h2 className='text-sm font-medium uppercase tracking-wide text-muted-foreground'>
            Cover image
          </h2>
          {heroImage ? (
            <img
              src={heroImage.src}
              alt={heroImage.alt || 'Cover preview'}
              className='aspect-[16/10] w-full rounded-lg border object-cover'
            />
          ) : (
            <div className='flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground'>
              No cover image
            </div>
          )}
          <div className='flex flex-wrap gap-2'>
            <button
              id='hero-upload-button'
              type='button'
              onClick={() => heroFileRef.current?.click()}
              disabled={uploading}
              className='cursor-pointer rounded-lg border bg-muted px-3 py-1.5 text-xs transition-colors hover:bg-card disabled:opacity-50'
            >
              {uploading ? 'Uploading…' : heroImage ? 'Replace image' : 'Upload image'}
            </button>
            {heroImage && (
              <button
                type='button'
                onClick={() => setHeroImage(null)}
                className='cursor-pointer rounded-lg border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted'
              >
                Remove
              </button>
            )}
            <input
              id='hero-image-input'
              ref={heroFileRef}
              type='file'
              accept='image/png,image/jpeg,image/webp,image/gif,image/avif'
              className='hidden'
              onChange={onHeroFile}
            />
          </div>
          {heroImage && (
            <>
              <label className='field'>
                <span className='field-label'>Alt text</span>
                <input
                  className='field-input'
                  value={heroImage.alt ?? ''}
                  onChange={(event) =>
                    setHeroImage({ ...heroImage, alt: event.target.value })
                  }
                  placeholder='Describe the image'
                />
              </label>
              <label className='field'>
                <span className='field-label'>Accent color</span>
                <input
                  type='color'
                  className='h-9 w-full cursor-pointer rounded-lg border bg-background p-1'
                  value={/^#[0-9a-f]{6}$/i.test(heroImage.color ?? '') ? heroImage.color! : '#659eb9'}
                  onChange={(event) => setHeroImage({ ...heroImage, color: event.target.value })}
                />
              </label>
            </>
          )}
        </section>

        {postId && (
          <section className='space-y-2 rounded-2xl border border-red-500/20 bg-red-500/5 p-4'>
            <h2 className='text-sm font-medium uppercase tracking-wide text-red-600 dark:text-red-400'>
              Danger zone
            </h2>
            <p className='text-xs text-muted-foreground'>
              Deleting a post also removes its comments page link. This cannot be undone.
            </p>
            <DeletePostButton
              id={postId}
              title={title || 'this post'}
              redirectTo='/admin'
              className='w-full py-1.5 text-center'
            />
          </section>
        )}
      </aside>
    </div>
  )
}
