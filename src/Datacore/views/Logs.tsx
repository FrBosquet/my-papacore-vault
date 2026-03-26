import type { MarkdownListItem, MarkdownPage } from '@blacksmithgu/datacore'
import { Button } from '../components/shared/button'
import { Card } from '../components/shared/card'
import { Link } from '../components/shared/link'
import { YearGraph } from '../components/yeargraph/graph'
import {
  createFromTemplate,
  getDailyNoteDatetime,
  getFile,
  writeAtTheEndOfTheFile,
} from '../utils/files'
import { cleanLogText, getPrevValue, getValueFromLogText } from '../utils/logs'
import {
  moveToArchive,
  moveToDone,
  moveToOngoing,
  removeFromWeek,
} from '../utils/tasks'
import { getDailyNotePath, getTodayDatetime } from '../utils/time'

const RadioOption = ({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string
  value: 'today' | 'yesterday'
  label: string
  defaultChecked?: boolean
}) => {
  return (
    <label className="flex flex-1 cursor-pointer items-center justify-center bg-primary-900 px-2 py-1 uppercase text-sm font-semibold hover:bg-primary-800 transition-colors has-checked:bg-theme-accent has-checked:text-primary-950 has-focus:outline-2 has-focus:outline-theme-accent has-focus:outline-offset-2">
      <input
        className="sr-only"
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
      />
      {label}
    </label>
  )
}

export const Logs = () => {
  const thisFile = dc.useCurrentFile()
  const thisFileLink = thisFile.$link.toString()
  const parentLink = thisFile.value('parent')
  const progressFn = thisFile.value('progressFn') as string
  const progressTarget = thisFile.value('target') as number
  const today = getTodayDatetime()
  const yesterday = today.minus({ days: 1 })
  const todayPath = getDailyNotePath(today)

  const logs = dc
    .useQuery<MarkdownListItem>(`
      @list-item AND path("Journal") AND connected([[${thisFile.$path}]])
    `)
    .sort((a, b) => b.$file.localeCompare(a.$file))

  const firstAnnotationDate =
    logs.length > 0 ? getDailyNoteDatetime(logs[logs.length - 1].$file) : today
  const annotationCount = logs.length

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    let logContent = formData.get('log-content') as string
    const targetDay = formData.get('log-day') as string

    let targetPath: string
    if (targetDay === 'today') {
      targetPath = todayPath
    } else if (targetDay === 'yesterday') {
      targetPath = getDailyNotePath(yesterday)
    } else {
      throw new Error(`Invalid target day in log form. Check ${targetDay}`)
    }

    let file = getFile(targetPath)
    if (!file) {
      file = await createFromTemplate(targetPath, 'daily')
    }

    const isTask = thisFile.$path.startsWith('Kanban/Tasks/')

    if (isTask && logContent.includes('/done')) {
      logContent = logContent.replace('/done', '').trim()
      await moveToDone(thisFile as MarkdownPage)
    }

    if (isTask && logContent.includes('/backlog')) {
      logContent = logContent.replace('/backlog', '').trim()
      await removeFromWeek(thisFile as MarkdownPage)
    }

    if (isTask && logContent.includes('/ongoing')) {
      logContent = logContent.replace('/ongoing', '').trim()
      await moveToOngoing(thisFile as MarkdownPage)
    }

    if (isTask && logContent.includes('/archive')) {
      logContent = logContent.replace('/archive', '').trim()
      await moveToArchive(thisFile as MarkdownPage)
    }

    if (file && logContent.trim().length > 0) {
      const actualContent = [
        '-',
        parentLink?.toString(),
        thisFileLink.toString(),
        logContent,
      ]
        .filter(Boolean)
        .join(' ')

      await writeAtTheEndOfTheFile(targetPath, actualContent)
    }

    form.reset()
  }

  return (
    <Card>
      <Link
        icon="notebook-pen"
        path={todayPath}
        createIfNotExists
        template="daily"
      >
        Logs
      </Link>
      <YearGraph logs={logs} refDate={today} />
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <textarea
          name="log-content"
          id="log-content"
          className="w-full h-full bg-primary-900 text-primary-300 p-2 rounded-none border border-primary-800 focus:outline-none focus:ring-2 focus:ring-theme-accent resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              ;(e.currentTarget.form as HTMLFormElement).requestSubmit()
            }
          }}
        />
        <div className="flex w-full flex-row gap-2">
          <RadioOption
            name="log-day"
            value="today"
            label={`TODAY (${today.weekdayLong})`}
            defaultChecked
          />
          <RadioOption
            name="log-day"
            value="yesterday"
            label={`Yesterday (${yesterday.weekdayLong})`}
          />
          <Button
            className="focus:bg-contrast-300"
            iconRight="arrow-right"
            type="submit"
            tooltip="logear"
            label="Log"
          />
        </div>
      </form>
      <section>
        {logs.map((l, index) => {
          const filePath = l.$file
          const datetime = getDailyNoteDatetime(filePath)

          const isToday = datetime.equals(today)
          const isYesterday = datetime.equals(today.minus({ days: 1 }))
          const daysOfDifference = today.diff(datetime, 'days').days
          const daysSinceStart = datetime.diff(firstAnnotationDate, 'days').days

          const text = l.$text

          const cleanedText = cleanLogText(text ?? '')
          const value = getValueFromLogText(cleanedText)

          let textWithParentLink = cleanLogText(text ?? '', thisFile.$path)

          if (value) {
            const valueAsText = value.toString()
            textWithParentLink = textWithParentLink.replace(valueAsText, '')
          }

          const prevValue = getPrevValue(logs, index)

          const label = isToday
            ? 'Today'
            : isYesterday
              ? 'Yesterday'
              : daysOfDifference < 8
                ? `${daysOfDifference} da`
                : datetime.toFormat('MMM dd')

          return (
            <Link
              variant="plain"
              key={l.$id}
              path={filePath}
              className="flex gap-2 py-0.5"
            >
              <span className="text-xs uppercase block w-16 shrink-0 text-0 p-1 text-contrast-300 ">
                {label}
              </span>
              {/* <dc.Markdown
                className="flex-1"
                content={cleanLogText(textWithoutValue ?? '')}
              /> */}
              <dc.Markdown className="flex-1" content={textWithParentLink} />
              <ProgressBar
                value={value}
                prevValue={prevValue}
                progressFn={progressFn}
                progressTarget={progressTarget}
                index={annotationCount - index}
                daysPassed={daysSinceStart}
              />
            </Link>
          )
        })}
      </section>
    </Card>
  )
}

const ProgressBar = ({
  progressFn,
  progressTarget,
  index,
  value,
  prevValue,
  daysPassed,
}: {
  progressFn: string
  progressTarget: number
  index: number
  value?: number
  prevValue?: number
  daysPassed: number
}) => {
  if (!progressFn) return null

  switch (progressFn) {
    case 'days': {
      return (
        <span className="text-xs uppercase block shrink-0 text-0 p-1 text-contrast-300 justify-self-end">
          {daysPassed} / {progressTarget}
        </span>
      )
    }
    case 'count':
      return (
        <span className="text-xs uppercase block shrink-0 text-0 p-1 text-contrast-300 justify-self-end">
          {index} / {progressTarget}
        </span>
      )
    case 'value': {
      const progress = (value ?? 0) - (prevValue ?? 0)

      return (
        <span className="text-xs uppercase block shrink-0 text-0 p-1 text-contrast-300 justify-self-end">
          <strong>+{progress}</strong> {value} / {progressTarget}
        </span>
      )
    }
    default:
      return null
  }
}
