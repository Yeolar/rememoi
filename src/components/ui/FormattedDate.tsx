import { LocalizedDate } from '@/components/i18n/LocalizedDate'
import { cn } from '@/lib/utils'

type FormattedDateProps = {
  date: Date | string | number
  dateTimeOptions?: Intl.DateTimeFormatOptions
  className?: string
}

export function FormattedDate({ date, dateTimeOptions, className }: FormattedDateProps) {
  const value = new Date(date)
  return (
    <span className={cn('text-muted-foreground font-mono', className)}>
      <LocalizedDate date={value} dateTimeOptions={dateTimeOptions} />
    </span>
  )
}
