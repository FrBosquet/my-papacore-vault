import type { MarkdownListItem } from '@blacksmithgu/datacore'
import { LogAnnotationForm } from '../components/logs/log-annotation-form'
import { ProgressBar } from '../components/logs/progress-bar'
import { Card } from '../components/shared/card'
import { Link } from '../components/shared/link'
import { YearGraph } from '../components/yeargraph/graph'
import { getDailyNoteDatetime } from '../utils/files'
import { cleanLogText, getPrevValue, getValueFromLogText } from '../utils/logs'
import {
  getDailyNotePath,
  getSemanticDateOffset,
  getTodayDatetime,
} from '../utils/time'

export const Logs = () => {
  const thisFile = dc.useCurrentFile()
  const progressFn = thisFile.value('progressFn') as string
  const progressTarget = thisFile.value('target') as number
  const today = getTodayDatetime()
  const todayPath = getDailyNotePath(today)

  const logs = dc
    .useQuery<MarkdownListItem>(`
      @list-item AND path("Journal") AND connected([[${thisFile.$path}]])
    `)
    .sort((a, b) => b.$file.localeCompare(a.$file))

  const firstAnnotationDate =
    logs.length > 0 ? getDailyNoteDatetime(logs[logs.length - 1].$file) : today
  const annotationCount = logs.length

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
      <LogAnnotationForm targetPage={thisFile} />
      <section>
        {logs.map((l, index) => {
          const filePath = l.$file
          const datetime = getDailyNoteDatetime(filePath)

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

          const label = getSemanticDateOffset(datetime)

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
