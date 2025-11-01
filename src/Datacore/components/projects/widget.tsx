import type { MarkdownPage } from "@blacksmithgu/datacore"
import { getFrontmatterValue } from "../../utils/markdown"
import { Card } from "../shared/card"
import { Link } from "../shared/link"
import { Scroller } from "../shared/scroller"
import { WidgetItem } from "../shared/widget"

export const ProjectsWidget = () => {
  const projects = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Projects")
    AND status = "ongoing"
  `).sort((a, b) => a.$name.localeCompare(b.$name))

  return <Card>
    <Link path="Projects/Hub.base" icon="folder-kanban">Working on</Link>
    <Scroller className="h-30 @container" wrapperClassName="gap-2 grid grid-cols-2 @[540px]:grid-cols-3 ">
      {projects.map((project) => (
        <ProjectItem key={project.$id} project={project} />
      ))}
    </Scroller>
  </Card>
}

const useTasks = (project: MarkdownPage) => {
  const tasks = dc.useQuery<MarkdownPage>(`
    @page
    AND path("Kanban/Tasks")
    AND linksTo([[${project.$path}]])
  `)

  return tasks
}

const ProjectItem = ({ project }: { project: MarkdownPage }) => {
  const tasks = useTasks(project)

  const byStatus = tasks.reduce((acc, task) => {
    const status = getFrontmatterValue<string>(task, 'status')

    if (!status) {
      acc.none.push(task)
      return acc
    }

    if (!acc[status]) {
      acc[status] = []
    }

    acc[status].push(task)
    return acc
  }, {
    none: []
  } as Record<string, MarkdownPage[]>)

  const backlog = byStatus.backlog?.length ?? 0
  const thisWeek = byStatus['this-week']?.length ?? 0
  const ongoing = byStatus.ongoing?.length ?? 0
  const done = byStatus.done?.length ?? 0


  return (
    <WidgetItem
      page={project}
      tooltip={project.$name}
      className="h-6 text-primary-300 text-xs gap-0 tracking-normal"
    >
      <div>
        <p className="">{project.$name}</p>
        <p className="text-primary-600">(
          <span>{backlog}</span>|
          <span data-danger={thisWeek > 0} className="data-[danger=true]:text-orange-700">{thisWeek}</span>|
          <span>{ongoing}</span>|
          <span data-success={done > 0} className="data-[success=true]:text-emerald-400">{done}</span>)</p>
      </div>
    </WidgetItem>
  )
}
