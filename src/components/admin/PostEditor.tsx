'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { AdminDatePicker } from '@/components/admin/AdminDatePicker'
import { AdminSelect } from '@/components/admin/AdminSelect'
import { DeletePostButton } from '@/components/admin/DeletePostButton'
import { Trans } from '@/components/i18n/Trans'
import { Icon } from '@/components/icons/Icon'
import { LANGUAGE_OPTIONS } from '@/lib/languages'
import { POST_STATUS_LABELS } from '@/lib/post-status'
import { fallbackSlug, slugify } from '@/lib/slug'
import { showToast } from '@/lib/toast'
import { useLocale } from '@/lib/use-locale'
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
  const locale = useLocale()
  const t = (en: string, zh: string) => (locale === 'zh' ? zh : en)
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
        throw new Error(data.message || data.error || t('Upload failed', '上传失败'))
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
      showToast({ message: t('Cover image uploaded.', '封面上传成功。') })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : t('Upload failed', '上传失败') })
    }
  }

  const onInlineFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const uploaded = await uploadFile(file)
      insertAtCursor(`\n![${file.name.replace(/\.[^.]+$/, '')}](${uploaded.url})\n`)
      showToast({ message: t('Image inserted into the post.', '图片已插入文章。') })
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : t('Upload failed', '上传失败') })
    }
  }

  const save = async (targetStatus: PostStatus) => {
    setMessage(null)
    if (!title.trim()) {
      setMessage({ type: 'error', text: t('A title is required before saving.', '保存前需要填写标题。') })
      return
    }
    if (!body.trim()) {
      setMessage({ type: 'error', text: t('The post body cannot be empty.', '文章正文不能为空。') })
      return
    }

    const finalSlug = (slug.trim() || slugify(title) || fallbackSlug()).toLowerCase()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) {
      setMessage({
        type: 'error',
        text: t(
          'Slug may only contain lowercase letters, numbers and single dashes.',
          'Slug 只能包含小写字母、数字和单个连字符。'
        )
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
        throw new Error(issues.length > 0 ? issues.join('\n') : data.message || data.error || t('Save failed', '保存失败'))
      }

      const saved = data.data as AdminPostDTO
      const created = !postId
      setPostId(saved.id)
      setSlug(saved.slug)
      setStatus(saved.status)
      const savedMessage =
        saved.status === 'published'
          ? t('Published successfully.', '发布成功。')
          : saved.status === 'private'
            ? t('Marked private.', '已设为私有。')
            : t('Draft saved.', '草稿已保存。')
      setMessage({ type: 'success', text: savedMessage })
      showToast({ message: savedMessage })
      if (created) router.replace(`/admin/posts/${saved.id}`)
      router.refresh()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t('Save failed.', '保存失败。')
      })
    } finally {
      setSaving(null)
    }
  }

  const busy = saving !== null || uploading

  const formatOptions = [
    { value: 'mdx', label: t('MDX — Markdown + components', 'MDX — Markdown + 组件') },
    { value: 'md', label: 'Markdown' }
  ]
  const languageOptions = [
    { value: '', label: t('Unspecified', '未指定') },
    ...LANGUAGE_OPTIONS.map((option) => ({
      value: option.code,
      label: `${option.label} (${option.code})`
    }))
  ]

  return (
    <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]'>
      <div className='flex min-w-0 flex-col gap-5'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div className='min-w-0'>
            <p className='text-xs uppercase tracking-wider text-muted-foreground'>
              {mode === 'create' ? (
                <Trans en='New post' zh='新建文章' />
              ) : (
                <Trans en='Edit post' zh='编辑文章' />
              )}
            </p>
            <h1 className='truncate text-2xl font-medium'>
              {title.trim() || <Trans en='Untitled' zh='无标题' />}
            </h1>
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
            <Trans en={POST_STATUS_LABELS[status].en} zh={POST_STATUS_LABELS[status].zh} />
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
          <span className='field-label'><Trans en='Title' zh='标题' /></span>
          <input
            className='field-input text-lg font-medium'
            value={title}
            onChange={(event) => updateTitle(event.target.value)}
            placeholder={t('A title worth remembering', '一个值得记住的标题')}
          />
        </label>

        <div className='field'>
          <span className='field-label'><Trans en='Slug' zh='Slug' /></span>
          <div className='flex items-stretch overflow-hidden rounded-lg border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10'>
            <span className='flex items-center border-r bg-muted px-3 text-sm text-muted-foreground'>
              /memory/
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
          <span className='field-label'><Trans en='Description' zh='描述' /></span>
          <textarea
            className='field-input'
            rows={2}
            maxLength={300}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t(
              'One or two sentences that appear in previews and search results.',
              '一两句话，会出现在预览和搜索结果中。'
            )}
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
              <Trans en='Code' zh='代码' />
            </button>
            <button
              type='button'
              onClick={() => wrapSelection('[', '](https://)', 'link text')}
              className='cursor-pointer rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground'
            >
              <Trans en='Link' zh='链接' />
            </button>
            <button
              type='button'
              onClick={() => insertAtCursor('\n```ts\n\n```\n')}
              className='cursor-pointer rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground'
            >
              <Trans en='Code block' zh='代码块' />
            </button>
            <button
              type='button'
              onClick={() => inlineFileRef.current?.click()}
              disabled={uploading}
              className='flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Icon name='qrcode' className='size-3.5 rotate-90' />
              <Trans en='Image' zh='图片' />
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
            placeholder={t('Write in Markdown or MDX…', '使用 Markdown 或 MDX 写作…')}
            spellCheck
          />
          <div className='flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-xs text-muted-foreground'>
            <span>
              <Trans
                en={<>{body.length} characters · {body.split('\n').length} lines</>}
                zh={<>{body.length} 个字符 · {body.split('\n').length} 行</>}
              />
            </span>
            <span>
              <Trans
                en='MDX components: Aside, Collapse, Tabs, Steps, Spoiler, Timeline, Button, Card'
                zh='MDX 组件：Aside、Collapse、Tabs、Steps、Spoiler、Timeline、Button、Card'
              />
            </span>
          </div>
        </div>
      </div>

      <aside className='flex flex-col gap-5'>
        <section className='rounded-2xl border bg-background p-4'>
          <h2 className='mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground'>
            <Trans en='Publish' zh='发布' />
          </h2>
          <div className='flex flex-col gap-2'>
            <button
              type='button'
              onClick={() => save('published')}
              disabled={busy}
              className='flex cursor-pointer items-center justify-center gap-2 rounded-lg border bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {saving === 'published' ? (
                <Trans en='Saving…' zh='保存中…' />
              ) : status === 'published' ? (
                <Trans en='Update' zh='更新' />
              ) : (
                <Trans en='Publish' zh='发布' />
              )}
            </button>
            <button
              type='button'
              onClick={() => save('draft')}
              disabled={busy}
              className='cursor-pointer rounded-lg border bg-muted px-4 py-2 text-sm transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-50'
            >
              {saving === 'draft' ? (
                <Trans en='Saving…' zh='保存中…' />
              ) : status === 'published' ? (
                <Trans en='Unpublish' zh='取消发布' />
              ) : (
                <Trans en='Save draft' zh='保存草稿' />
              )}
            </button>
            <button
              type='button'
              onClick={() => save('private')}
              disabled={busy}
              className='cursor-pointer rounded-lg border bg-muted px-4 py-2 text-sm transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-50'
            >
              {saving === 'private' ? (
                <Trans en='Saving…' zh='保存中…' />
              ) : status === 'private' ? (
                <Trans en='Private' zh='私有' />
              ) : (
                <Trans en='Make private' zh='设为私有' />
              )}
            </button>
            <p className='text-xs text-muted-foreground'>
              <Trans
                en='Private posts are hidden from the public site and feeds.'
                zh='私有文章不会出现在公开站点和订阅源中。'
              />
            </p>
            {previewHref ? (
              <Link
                href={previewHref}
                target='_blank'
                className='text-center text-sm text-muted-foreground underline-offset-4 hover:underline'
              >
                <Trans en='Open preview ↗' zh='打开预览 ↗' />
              </Link>
            ) : (
              <span className='text-center text-xs text-muted-foreground'>
                <Trans en='Save first to preview the post.' zh='请先保存，再预览文章。' />
              </span>
            )}
            {status === 'published' && postId && (
              <Link
                href={`/memory/${slug}`}
                target='_blank'
                className='text-center text-sm text-muted-foreground underline-offset-4 hover:underline'
              >
                <Trans en='View live ↗' zh='查看线上页面 ↗' />
              </Link>
            )}
          </div>
        </section>

        <section className='space-y-3 rounded-2xl border bg-background p-4'>
          <h2 className='text-sm font-medium uppercase tracking-wide text-muted-foreground'>
            <Trans en='Details' zh='详细信息' />
          </h2>
          <div className='field'>
            <span className='field-label'><Trans en='Publish date' zh='发布日期' /></span>
            <AdminDatePicker
              value={publishDate}
              onChange={setPublishDate}
              ariaLabel={t('Publish date', '发布日期')}
            />
          </div>
          <div className='field'>
            <span className='field-label'><Trans en='Format' zh='格式' /></span>
            <AdminSelect
              value={format}
              options={formatOptions}
              onChange={(value) => setFormat(value as 'md' | 'mdx')}
              ariaLabel={t('Format', '格式')}
            />
          </div>
          <label className='field'>
            <span className='field-label'><Trans en='Tags' zh='标签' /></span>
            <input
              className='field-input'
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder={t('design, nextjs, notes', '设计, nextjs, 笔记')}
            />
            <span className='text-xs text-muted-foreground'><Trans en='Comma separated, lowercased.' zh='用逗号分隔，会自动转为小写。' /></span>
          </label>
          <div className='field'>
            <span className='field-label'><Trans en='Language' zh='语言' /></span>
            <AdminSelect
              value={language}
              options={languageOptions}
              onChange={setLanguage}
              ariaLabel={t('Language', '语言')}
            />
            <span className='text-xs text-muted-foreground'>
              <Trans en='Used for the language badge and filters.' zh='用于语言徽章和筛选。' />
            </span>
          </div>
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={pinned}
              onChange={(event) => setPinned(event.target.checked)}
            />
            <Trans en='Pin to the top of memory' zh='置顶到记忆列表' />
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input
              type='checkbox'
              checked={commentsEnabled}
              onChange={(event) => setCommentsEnabled(event.target.checked)}
            />
            <Trans en='Enable comments' zh='开启评论' />
          </label>
        </section>

        <section className='space-y-3 rounded-2xl border bg-background p-4'>
          <h2 className='text-sm font-medium uppercase tracking-wide text-muted-foreground'>
            <Trans en='Cover image' zh='封面图' />
          </h2>
          {heroImage ? (
            <img
              src={heroImage.src}
              alt={heroImage.alt || t('Cover preview', '封面预览')}
              className='aspect-[16/10] w-full rounded-lg border object-cover'
            />
          ) : (
            <div className='flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground'>
              <Trans en='No cover image' zh='暂无封面图' />
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
              {uploading ? (
                <Trans en='Uploading…' zh='上传中…' />
              ) : heroImage ? (
                <Trans en='Replace image' zh='更换图片' />
              ) : (
                <Trans en='Upload image' zh='上传图片' />
              )}
            </button>
            {heroImage && (
              <button
                type='button'
                onClick={() => setHeroImage(null)}
                className='cursor-pointer rounded-lg border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted'
              >
                <Trans en='Remove' zh='移除' />
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
                <span className='field-label'><Trans en='Alt text' zh='替代文本' /></span>
                <input
                  className='field-input'
                  value={heroImage.alt ?? ''}
                  onChange={(event) =>
                    setHeroImage({ ...heroImage, alt: event.target.value })
                  }
                  placeholder={t('Describe the image', '描述这张图片')}
                />
              </label>
              <label className='field'>
                <span className='field-label'><Trans en='Accent color' zh='强调色' /></span>
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
              <Trans en='Danger zone' zh='危险操作' />
            </h2>
            <p className='text-xs text-muted-foreground'>
              <Trans en='Deleting a post also removes its comments page link. This cannot be undone.' zh='删除文章会同时移除它的评论页链接，且无法撤销。' />
            </p>
            <DeletePostButton
              id={postId}
              title={title || t('this post', '这篇文章')}
              redirectTo='/admin'
              className='w-full py-1.5 text-center'
            />
          </section>
        )}
      </aside>
    </div>
  )
}
