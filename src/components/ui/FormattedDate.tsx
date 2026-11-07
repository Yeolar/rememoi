import { cn, getFormattedDate } from '@/lib/utils'

type FormattedDateProps = {
  date: Date | string | number
  dateTimeOptions?: Intl.DateTimeFormatOptions
  className?: string
}

export function FormattedDate({ date, dateTimeOptions, className }: FormattedDateProps) {
  const value = new Date(date)
  return (
    <span className={cn('text-muted-foreground font-mono', className)}>
      <time dateTime={value.toISOString()}>{getFormattedDate(value, dateTimeOptions)}</time>
    </span>
  )
}
