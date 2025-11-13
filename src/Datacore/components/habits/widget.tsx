import type { DateTime } from 'luxon'
import { useEffect, useState } from 'preact/hooks'
import {
  useFileFrontmatterState,
  useFrontmatterState,
} from '../../hooks/markdown'
import { createFromTemplate } from '../../utils/files'
import { getTodayDatetime } from '../../utils/time'
import { Button } from '../shared/button'
import { Card } from '../shared/card'
import { Link } from '../shared/link'
import { habitConfig } from './habit-config'

const habitList = Object.entries(habitConfig)
  .map(([key, value]) => ({
    ...value,
    key,
  }))
  .sort((a, b) => a.key.localeCompare(b.key))

const dailyHabitList = habitList.filter(
  (habit) => habit.category === 'personal'
)
const workHabitList = habitList.filter((habit) => habit.category === 'work')

type Habit = (typeof habitList)[number]

export const HabitWidget = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [td, setTd] = useFrontmatterState<DateTime>('target-date')

  useEffect(() => {
    setIsLoading(false)
  }, [td])

  const today = getTodayDatetime()
  const targetDate = td ?? today
  const isToday = targetDate.toISODate() === today.toISODate()

  const weekNumber = targetDate.weekNumber
  const localWeekday = targetDate.weekdayLong
  const localDay = targetDate.day
  const monthNumber = targetDate.month
  const localMonth = targetDate.monthLong
  const localYear = targetDate.year
  const relativeCal = targetDate.toRelativeCalendar()
  const isWeekend = targetDate.isWeekend

  const path = `Journal/${localYear}-${monthNumber.toString().padStart(2, '0')}-${localDay.toString().padStart(2, '0')}.md`

  const dateLabel = `${localDay} ${localMonth} ${localYear} (${relativeCal})`

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
        <div className="flex items-center flex-1">
          <p className="text-xs uppercase font-semibold">Diarios:</p>
        </div>
        <div className="flex items-center pr-1">
          <p className="text-xs capitalize">{`${localWeekday}, W${weekNumber}`}</p>
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
        {dailyHabitList.map((habit) => (
          <HabitToggle habit={habit} targetPath={path} />
        ))}
        <p className="col-start-1 -col-end-1 text-xs uppercase font-semibold">
          Trabajo:
        </p>
        {workHabitList.map((habit) => (
          <HabitToggle habit={habit} targetPath={path} faded={isWeekend} />
        ))}
      </section>
    </Card>
  )
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
  const [togglePending, setTogglePending] = useState(false)
  const [page] = dc.useQuery(`@page and $path = "${targetPath}"`)
  const [isDone, setIsDone, isLoading] = useFileFrontmatterState<boolean>(
    targetPath,
    habit.key
  )

  const handleClick = async () => {
    if (!page) {
      await createFromTemplate(targetPath, 'daily')
      setTogglePending(true)
      return
    }

    setIsDone(!isDone)
  }

  // Small hack to wait for the page to be created
  useEffect(() => {
    if (togglePending && page) {
      setIsDone(!isDone)
      setTogglePending(false)
    }
  }, [togglePending, page])

  return (
    <button
      aria-label={habit.tooltip ?? habit.label}
      type="button"
      data-is-done={isDone}
      data-faded={faded}
      onClick={handleClick}
      className="aspect-square flex-col flex items-center justify-center h-auto text-xs gap-2 cursor-pointer data-[is-done=true]:bg-theme-accent data-[is-done=true]:text-primary-950 rounded-none border-none bg-primary-900 shadow-none data-[faded=true]:opacity-50"
    >
      <dc.Icon
        className={isLoading ? 'animate-spin' : ''}
        icon={isLoading ? 'loader' : habit.icon}
      />
      <span>{habit.label}</span>
    </button>
  )
}
