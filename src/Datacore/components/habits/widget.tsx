import type { MarkdownPage, MarkdownSection } from '@blacksmithgu/datacore'
import type { DateTime } from 'luxon'
import {
  useFileFrontmatterState,
  useFrontmatterState,
} from '../../hooks/markdown'
import { classMerge } from '../../utils/classMerge'
import {
  createFromTemplate,
  getDailyNoteDatetime,
  getFile,
  getLeaf,
} from '../../utils/files'
import { calculateStreak } from '../../utils/habits'
import { getDailyNotePath, getTodayDatetime } from '../../utils/time'
import { Button } from '../shared/button'
import { Card } from '../shared/card'
import { Link } from '../shared/link'
import { LongPressButton } from '../shared/long-press-button'

type Habit = {
  key: string
  label: string
  icon: string
  category: string
  highlight: boolean
  tooltip: string
  skipon: number[]
}

const CATEGORIES_ORDER = ['trabajo', 'mañana', 'tarde', 'noche']

export const HabitWidget = () => {
  const habitList = dc
    .useQuery<MarkdownPage>(`@page and path("Habits")`)
    .filter((p) => p.value('paused') !== true)
    .map(
      (page): Habit => ({
        key: page.$name,
        label: page.value('label') as string,
        icon: page.value('icon') as string,
        category: page.value('category') as string,
        highlight: page.value('highlight') as boolean,
        tooltip: ``,
        skipon: (() => {
          const skipon = page.value('skipon')
          return skipon != null ? (skipon as string).split(',').map(Number) : []
        })(),
      })
    )
    .sort((a, b) => a.key.localeCompare(b.key))

  const [isLoading, setIsLoading] = dc.useState(false)
  const [td, setTd] = useFrontmatterState<DateTime>('target-date')

  dc.useEffect(() => {
    setIsLoading(false)
  }, [td])

  const today = getTodayDatetime()
  const targetDate = td ?? today
  const isToday = targetDate.toISODate() === today.toISODate()
  const weekNumber = targetDate.weekNumber
  const weekday = targetDate.weekday
  const localWeekday = targetDate.weekdayLong
  const localDay = targetDate.day
  const localMonth = targetDate.monthLong
  const localYear = targetDate.year
  const relativeCal = targetDate.toRelativeCalendar()

  const path = getDailyNotePath(targetDate)

  const dateLabel = `${localWeekday}, ${localDay} ${localMonth} ${localYear}`

  const handleNextDay = () => {
    setIsLoading(true)
    const target = targetDate.plus({ days: 1 })

    if (target.toISODate() === today.toISODate()) {
      setTd(undefined)
    } else {
      setTd(target)
    }
  }

  const handlePreviousDay = () => {
    setIsLoading(true)
    const target = targetDate.minus({ days: 1 })

    if (target.toISODate() === today.toISODate()) {
      setTd(undefined)
    } else {
      setTd(target)
    }
  }

  const handleToday = () => {
    setIsLoading(true)
    setTd(undefined)
  }

  const filteredHabits = habitList.filter(
    (habit) => !habit.skipon.includes(weekday)
  )
  const byCategory = Object.entries(
    filteredHabits.reduce(
      (acc, habit) => {
        const category = habit.category ?? 'default'

        if (!acc[category]) {
          acc[category] = []
        }

        acc[category].push(habit)
        return acc
      },
      {} as Record<string, Habit[]>
    )
  ).sort((a, b) => {
    const aIndex = CATEGORIES_ORDER.indexOf(a[0])
    const bIndex = CATEGORIES_ORDER.indexOf(b[0])

    if (aIndex === bIndex) {
      return a[0].localeCompare(b[0])
    }

    return aIndex - bIndex
  })

  return (
    <Card>
      <Link icon="shell" path="TODAY.md">
        Habits
      </Link>

      {/* time control */}
      <section className="flex-1 flex justify-center">
        <Link path={path}>{dateLabel}</Link>
      </section>
      <header className="flex gap-1 w-full justify-end item">
        <div className="flex items-center flex-1" />
        <div className="flex items-center pr-1">
          <p className="text-xs capitalize">{`${relativeCal}, W${weekNumber}`}</p>
        </div>
        <Button
          variant="secondary"
          icon="arrow-big-left"
          size="icon"
          tooltip="Dia previo"
          onClick={handlePreviousDay}
          isLoading={isLoading}
        />
        <Button
          size="icon"
          onClick={handleToday}
          disabled={isToday}
          tooltip="Ir a hoy"
          isLoading={isLoading}
        >
          Hoy
        </Button>
        <Button
          variant="secondary"
          icon="arrow-big-right"
          size="icon"
          tooltip="Dia siguiente"
          disabled={isToday}
          onClick={handleNextDay}
          isLoading={isLoading}
        />
      </header>

      {/* Habits */}
      <section className="grid grid-cols-auto-4 gap-2">
        {byCategory.map(([category, habits]) => (
          <>
            {category !== 'default' && (
              <p className="text-xs uppercase font-semibold col-span-full">
                {category.replace('_', ' ')}
              </p>
            )}
            {habits.map((habit) => (
              <HabitToggle habit={habit} targetPath={path} />
            ))}
          </>
        ))}
      </section>
    </Card>
  )
}

const getFileContent = async (path: string) => {
  const file = dc.app.vault.getFileByPath(path)
  if (!file) return null
  return await dc.app.vault.read(file)
}

const HabitToggle = ({
  habit,
  targetPath,
  faded,
}: {
  habit: Habit
  targetPath: string
  faded?: boolean
}) => {
  const [tooltipContent, setTooltipContent] = dc.useState<string>(``)
  const notes = dc.useQuery<MarkdownPage>(
    `@page and path("Journal") and ${habit.key}`
  )

  const tooltipDescriptor = dc.useQuery<MarkdownSection>(
    `@section and $title="Tooltip" and $file="Habits/${habit.key}.md"`
  )

  const loadTooltipContent = async () => {
    if (!tooltipDescriptor[0]?.$position) return

    const position = tooltipDescriptor[0]?.$position

    const fileContent = await getFileContent(
      tooltipDescriptor[0]?.$file as string
    )
    if (!fileContent) return

    const lines = fileContent.split('\n')
    const tooltipLines = lines.splice(
      position.start + 1,
      position.end - position.start
    )
    setTooltipContent(tooltipLines.join('\n'))
  }

  dc.useEffect(() => {
    loadTooltipContent()
  }, [tooltipDescriptor])

  const targetDate = getDailyNoteDatetime(targetPath)
  const streak = calculateStreak(notes, targetDate)

  const inStreak = streak?.type === 'streak' && streak?.days > 1
  const inWarningHiatus =
    streak?.type === 'hiatus' && streak?.days < 3 && streak?.days > 1
  const inDangerHiatus = streak?.type === 'hiatus' && streak?.days >= 3

  const [togglePending, setTogglePending] = dc.useState(false)
  const [page] = dc.useQuery(`@page and $path = "${targetPath}"`)
  const [isDone, setIsDone, isLoading] = useFileFrontmatterState<boolean>(
    targetPath,
    habit.key
  )

  const [optimisticIsDone, setOptimisticIsDone] = dc.useState(isDone)

  const handleClick = async () => {
    if (!page) {
      await createFromTemplate(targetPath, 'daily')
      setTogglePending(true)
      return
    }
    setOptimisticIsDone(!optimisticIsDone)
    setIsDone(!isDone)
  }

  // dc.useEffect(() => {
  //   if (togglePending && page) {
  //     setIsDone(!isDone)
  //     setTogglePending(false)
  //   }
  // }, [togglePending, page])

  dc.useEffect(() => {
    if (!isLoading && optimisticIsDone !== isDone) {
      setOptimisticIsDone(isDone)
    }
  }, [isDone, optimisticIsDone, isLoading])

  const renderStreak = () => {
    if (isLoading) return null
    if (!streak) return null
    if (streak?.days === 1) return null

    if (streak?.type === 'streak') {
      return `+${streak?.days}`
    }

    if (streak?.type === 'hiatus') {
      return `${streak?.days} days`
    }

    return 'Never done'
  }

  const handleLongPress = async () => {
    // navigate to the habit page using leaf
    const leaf = getLeaf(true)
    const file = getFile(`Habits/${habit.key}.md`)

    if (!file) {
      throw new Error(`Habit file not found: Habits/${habit.key}.md`)
    }
    leaf.openFile(file)
  }

  return (
    <LongPressButton
      ariaLabel={tooltipContent ?? habit.label}
      isDone={optimisticIsDone}
      faded={faded}
      onClick={handleClick}
      onLongPress={handleLongPress}
      className="aspect-square flex-col flex items-center justify-center h-auto text-xs gap-2 cursor-pointer data-[is-done=true]:bg-theme-accent data-[is-done=true]:text-primary-950 rounded-none border-none bg-primary-900 shadow-none data-[faded=true]:opacity-50 relative"
    >
      {habit.icon ? (
        <dc.Icon
          className={isLoading ? 'animate-spin' : ''}
          icon={isLoading ? 'loader' : habit.icon}
        />
      ) : (
        habit.key
      )}
      <span>{habit.label}</span>
      <div
        className={classMerge(
          'absolute bottom-0 to-transparent bg-size-[100%_200%] bg-position-[50%_10px] bg-no-repeat uppercase text-xs font-semibold p-2 bg-radial h-6 w-full',
          inStreak
            ? 'from-green-50 text-primary-900 text-base h-8 bg-position-[50%_8px]'
            : undefined,
          inWarningHiatus ? 'from-yellow-700/20 text-yellow-400' : undefined,
          inDangerHiatus ? 'from-red-700/20 text-red-400' : undefined
        )}
      >
        {renderStreak()}
      </div>
    </LongPressButton>
  )
}
