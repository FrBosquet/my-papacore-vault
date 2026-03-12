/** biome-ignore-all lint/a11y/noStaticElementInteractions: I need to bypass button default styles */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: I need to bypass button default styles */
/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: I need to bypass button default styles */
import type { MarkdownListItem } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import { classMerge } from '../../utils/classMerge'
import { getDailyNoteDatetime, getFile, getLeaf } from '../../utils/files'
import {
  cleanLogText,
  getPrevValue,
  getValueFromLogText,
} from '../../utils/logs'

export const YearGraph = ({
  logs,
  refDate,
}: {
  logs: MarkdownListItem[]
  refDate: DateTime
}) => {
  const lastDayOfYear = refDate.endOf('year')
  const firstDayOfYear = refDate.startOf('year')

  const weeksInYear = lastDayOfYear.weekNumber
  const daysInYear = lastDayOfYear.daysInYear

  const [hoveredDate, setHoveredDate] = dc.useState<DateTime | undefined>(
    undefined
  )

  const logsProgress = dc.useMemo(() => {
    return logs.map((l, index) => {
      const value = getValueFromLogText(cleanLogText(l.$text ?? ''))
      const prevValue = getPrevValue(logs, index)

      return value !== undefined ? (value ?? 0) - (prevValue ?? 0) : 0
    })
  }, [logs])

  const maxLogsProgress = dc.useMemo(() => {
    return Math.max(...logsProgress)
  }, [logs])

  const handleMouseEnter = (date: DateTime) => {
    setHoveredDate(date)
  }

  const handleMouseLeave = () => {
    setHoveredDate(undefined)
  }

  return (
    <>
      {hoveredDate && (
        <div className="absolute top-0 right-0 bg-primary-950 p-2 z-10 text-sm uppercase font-semibold text-green-400">
          {hoveredDate.weekdayLong} W{hoveredDate.weekNumber}, {hoveredDate.day}{' '}
          {hoveredDate.monthLong} {hoveredDate.year}
        </div>
      )}
      <section
        className="grid gap-px"
        style={{
          'grid-template-columns': `repeat(${weeksInYear}, 1fr)`,
          'grid-template-rows': `repeat(7, 1fr)`,
        }}
      >
        {Array.from({ length: daysInYear }).map((_, index) => {
          const date = firstDayOfYear.plus({ days: index })
          const isToday = date.equals(refDate)
          const isInTheFuture = date.diff(refDate, 'days').days > 0
          const dayOfWeek = date.weekday
          const weekNumber = date.weekNumber

          return (
            <div
              onMouseEnter={() => handleMouseEnter(date)}
              onMouseLeave={handleMouseLeave}
              key={index}
              style={{
                'grid-column': weekNumber,
                'grid-row': dayOfWeek,
              }}
              className={classMerge(
                'bg-primary-500 hover:bg-primary-600 aspect-square cursor-help',
                isToday && 'bg-contrast-500',
                isInTheFuture && 'bg-primary-800'
              )}
              aria-label={date.toLocaleString()}
            />
          )
        })}
        {logs.map((l, index) => {
          const filePath = l.$file
          const date = getDailyNoteDatetime(filePath)

          if (date.year !== refDate.year) return null

          const progress = logsProgress[index]
          const opacity =
            maxLogsProgress > 0 ? (progress / maxLogsProgress) * 0.5 + 0.5 : 1

          const handleClick = (e: MouseEvent) => {
            // copy navigation logic from link component
            const file = getFile(filePath)
            if (file) {
              const isCtrlPressed = e.ctrlKey || e.metaKey
              getLeaf(isCtrlPressed).openFile(file)
            }
          }

          const text = cleanLogText(l.$text ?? '')
          const label = progress > 0 ? `+${progress} (${text})` : text

          return (
            <div
              onClick={handleClick}
              style={{
                'grid-column': date.weekNumber,
                'grid-row': date.weekday,
                opacity,
              }}
              className="p-0 m-0 border-none bg-green-400 shadow-none cursor-pointer w-full aspect-square"
              onMouseEnter={() => handleMouseEnter(date)}
              onMouseLeave={handleMouseLeave}
              key={l.$id}
              aria-label={label}
            />
          )
        })}
      </section>
    </>
  )
}
