import { TaskRow } from '../components/tasks/task-row'

export const TaskManager = () => {
  const thisTask = dc.useCurrentFile()

  return <TaskRow task={thisTask} />
}
