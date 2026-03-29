import type { MarkdownPage } from '@blacksmithgu/datacore'
import {
  createFromTemplate,
  getFile,
  writeAtTheEndOfTheFile,
} from '../../utils/files'
import {
  moveToArchive,
  moveToDone,
  moveToOngoing,
  removeFromWeek,
} from '../../utils/tasks'
import { getDailyNotePath, getTodayDatetime } from '../../utils/time'
import { Button } from '../shared/button'

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

type Props = {
  targetPage: MarkdownPage
  onSubmit?: () => void
}

export const LogAnnotationForm = ({ targetPage, onSubmit }: Props) => {
  const today = getTodayDatetime()
  const todayPath = getDailyNotePath(today)
  const thisFileLink = targetPage.$link.toString()
  const parentLink = targetPage.value('parent')
  const parentLinkText = parentLink?.toString() ?? undefined
  const yesterday = today.minus({ days: 1 })

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

    const isTask = targetPage.$path.startsWith('Kanban/Tasks/')

    if (isTask && logContent.includes('/done')) {
      logContent = logContent.replace('/done', '').trim()
      await moveToDone(targetPage)
    }

    if (isTask && logContent.includes('/backlog')) {
      logContent = logContent.replace('/backlog', '').trim()
      await removeFromWeek(targetPage)
    }

    if (isTask && logContent.includes('/ongoing')) {
      logContent = logContent.replace('/ongoing', '').trim()
      await moveToOngoing(targetPage)
    }

    if (isTask && logContent.includes('/archive')) {
      logContent = logContent.replace('/archive', '').trim()
      await moveToArchive(targetPage)
    }

    if (file && logContent.trim().length > 0) {
      const actualContent = ['-', parentLinkText, thisFileLink, logContent]
        .filter(Boolean)
        .join(' ')

      await writeAtTheEndOfTheFile(targetPath, actualContent)
    }

    form.reset()
    onSubmit?.()
  }

  return (
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
  )
}
