import { Trans } from '@/components/i18n/Trans'
import { getChineseDate, getFormattedDate } from '@/lib/utils'

type LocalizedDateProps = {
  date: Date | string | number
  dateTimeOptions?: Intl.DateTimeFormatOptions
}

export function LocalizedDate({ date, dateTimeOptions }: LocalizedDateProps) {
  const value = new Date(date)
  const iso = value.toISOString()

  return (
    <Trans
      en={<time dateTime={iso}>{getFormattedDate(value, dateTimeOptions)}</time>}
      zh={<time dateTime={iso}>{getChineseDate(value)}</time>}
    />
  )
}
