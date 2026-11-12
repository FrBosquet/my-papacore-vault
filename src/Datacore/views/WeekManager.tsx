import type { MarkdownPage } from '@blacksmithgu/datacore'
import type { ComponentChildren } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { Button } from '../components/shared/button'
import { TaskRow } from '../components/tasks/task-row'
import {
  addToWeek,
  getDateFromWeekTag,
  getTagFromFileName,
  getTasksByMoment,
  taskSorter,
} from '../utils/tasks'

const normalizePath = (path: string) => path.replace(/\.md$/i, '')

const getTaskParentPath = (task: MarkdownPage) => {
  const parent = task.value('parent')
  if (!parent || typeof parent !== 'object' || !('path' in parent)) return
  if (typeof parent.path !== 'string' || parent.path.length === 0) return

  return normalizePath(parent.path)
}

const byOldestUpdate = (a: MarkdownPage, b: MarkdownPage) =>
  a.$mtime.toMillis() - b.$mtime.toMillis()

const edgeMask = (left: boolean, right: boolean) => {
  if (left && right) {
    return 'linear-gradient(to right, transparent, black 1.5rem, black calc(100% - 1.5rem), transparent)'
  }
  if (right)
    return 'linear-gradient(to right, black calc(100% - 1.5rem), transparent)'
  if (left) return 'linear-gradient(to right, transparent, black 1.5rem)'
  return undefined
}

const TabScroller = ({ children }: { children: ComponentChildren }) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })

  useEffect(() => {
    const scroller = scrollerRef.current
    const content = contentRef.current
    if (!scroller || !content) return

    const update = () => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth
      const left = scroller.scrollLeft > 1
      const right = maxScroll - scroller.scrollLeft > 1

      setEdges((current) =>
        current.left === left && current.right === right
          ? current
          : { left, right }
      )
    }

    update()
    scroller.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(scroller)
    observer.observe(content)

    return () => {
      scroller.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [])

  const scrollByDirection = (direction: -1 | 1) => {
    const scroller = scrollerRef.current
    if (!scroller) return

    scroller.scrollBy({
      left: direction * scroller.clientWidth * 0.7,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative min-w-0">
      <div
        ref={scrollerRef}
        className="pc-scroll-x min-w-0 overflow-x-auto"
        style={{ maskImage: edgeMask(edges.left, edges.right) }}
      >
        <div ref={contentRef} className="flex w-max gap-1">
          {children}
        </div>
      </div>
      {edges.left && (
        <Button
          icon="chevron-left"
          size="icon-xs"
          variant="ghost"
          tooltip="Proyectos anteriores"
          className="absolute top-1/2 left-0 z-10 -translate-y-1/2"
          onClick={() => scrollByDirection(-1)}
        />
      )}
      {edges.right && (
        <Button
          icon="chevron-right"
          size="icon-xs"
          variant="ghost"
          tooltip="Más proyectos"
          className="absolute top-1/2 right-0 z-10 -translate-y-1/2"
          onClick={() => scrollByDirection(1)}
        />
      )}
    </div>
  )
}

export const WeekManager = () => {
  const thisWeek = dc.useCurrentFile()

  const fileName = thisWeek.$name
  const tag = getTagFromFileName(fileName)
  const targetWeek = getDateFromWeekTag(tag)

  // I need the tasks that are tagged with the week tag
  const assignedTasks = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Kanban/Tasks")
    AND #${tag}
  `)

  const tasksNotInThisWeek = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Kanban/Tasks")
    AND !["backlog", "in-review", "done"].contains(status)
    AND !#${tag}
  `)

  const backlogTasks = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Kanban/Tasks")
    AND status = "backlog"
  `)

  const { carryOver, future } = getTasksByMoment(tasksNotInThisWeek, tag)

  const ongoingProjects = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Projects")
    AND status = "ongoing"
  `)

  const [selectedProjectPath, setSelectedProjectPath] = dc.useState<
    string | null
  >(null)

  const backlogByProject = backlogTasks.reduce((groups, task) => {
    const path = getTaskParentPath(task)
    if (!path) return groups

    const updated = task.$mtime.toMillis()
    const current = groups.get(path)
    if (!current) {
      groups.set(path, { count: 1, oldest: updated })
      return groups
    }

    current.count += 1
    if (updated < current.oldest) current.oldest = updated
    return groups
  }, new Map<string, { count: number; oldest: number }>())

  const projectsWithBacklog = ongoingProjects
    .filter((project) => backlogByProject.has(normalizePath(project.$path)))
    .sort((a, b) => {
      const aOldest =
        backlogByProject.get(normalizePath(a.$path))?.oldest ?? Infinity
      const bOldest =
        backlogByProject.get(normalizePath(b.$path))?.oldest ?? Infinity
      if (aOldest !== bOldest) return aOldest - bOldest

      return a.$name.localeCompare(b.$name, 'es')
    })

  const activeProjectPath = projectsWithBacklog.some(
    (project) => normalizePath(project.$path) === selectedProjectPath
  )
    ? selectedProjectPath
    : null

  const visibleBacklog = activeProjectPath
    ? backlogTasks.filter(
        (task) => getTaskParentPath(task) === activeProjectPath
      )
    : backlogTasks

  const orderedBacklog = activeProjectPath
    ? [...visibleBacklog].sort(byOldestUpdate)
    : [...visibleBacklog].sort(taskSorter)

  const handleCarryAll = () => {
    carryOver.forEach((task) => {
      addToWeek(task, tag)
    })
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p>
        Tagged as <strong>{tag}</strong>
      </p>
      <h3>This week ({assignedTasks.length}):</h3>
      {assignedTasks.length > 0 &&
        assignedTasks
          .sort(taskSorter)
          .map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} targetWeek={targetWeek} />
          ))}

      {carryOver.length > 0 && (
        <>
          <header className="flex items-center justify-between">
            <h3 className="uppercase p-0 m-0 text-sm tracking-wide font-semibold text-theme-accent">
              Carryover ({carryOver.length})
            </h3>
            <Button
              iconRight="calendar-arrow-up"
              size="sm"
              onClick={handleCarryAll}
            >
              Carry all
            </Button>
          </header>
          {carryOver.length > 0 &&
            carryOver
              .sort(taskSorter)
              .map((subtask) => (
                <TaskRow
                  key={subtask.$id}
                  task={subtask}
                  targetWeek={targetWeek}
                  showCarryButton
                />
              ))}
        </>
      )}

      {future.length > 0 && (
        <>
          <h3>Future ({future.length}):</h3>
          {future.length > 0 &&
            future
              .sort(taskSorter)
              .map((subtask) => (
                <TaskRow
                  key={subtask.$id}
                  task={subtask}
                  targetWeek={targetWeek}
                />
              ))}
        </>
      )}

      {backlogTasks.length > 0 && (
        <>
          <h3>Backlog ({orderedBacklog.length}):</h3>
          <TabScroller>
            <Button
              size="sm"
              className="shrink-0 whitespace-nowrap"
              variant={activeProjectPath ? 'ghost' : 'default'}
              onClick={() => setSelectedProjectPath(null)}
            >
              All ({backlogTasks.length})
            </Button>
            {projectsWithBacklog.map((project) => {
              const path = normalizePath(project.$path)
              const count = backlogByProject.get(path)?.count ?? 0

              return (
                <Button
                  key={project.$path}
                  size="sm"
                  className="shrink-0 whitespace-nowrap"
                  variant={activeProjectPath === path ? 'default' : 'ghost'}
                  onClick={() => setSelectedProjectPath(path)}
                >
                  {project.$name} ({count})
                </Button>
              )
            })}
          </TabScroller>
          {orderedBacklog.map((subtask) => (
            <TaskRow key={subtask.$id} task={subtask} targetWeek={targetWeek} />
          ))}
        </>
      )}
    </div>
  )
}
