import type { MarkdownPage } from '@blacksmithgu/datacore'
import { setPageFrontmatterValue } from '../../utils/markdown'
import { getTodayDatetime } from '../../utils/time'
import { Button } from '../shared/button'
import { Card } from '../shared/card'
import { Link } from '../shared/link'
import { AddReadLaterModal } from './add-modal'

export const ReadLaterWidget = () => {
  const [pointer, setPointer] = dc.useState(0)
  const pending = dc
    .useQuery<MarkdownPage>(`
  @page
  AND path("Readlist")
  AND !read
`)
    .sort((a, b) => a.$ctime.toMillis() - b.$ctime.toMillis())

  const target = pending[pointer]

  const handleNext = () => {
    setPointer((p) => (p + 1) % pending.length)
  }

  const handleMarkAsDone = () => {
    setPageFrontmatterValue(target, 'read', getTodayDatetime())

    if (pointer === pending.length - 1) {
      setPointer((pointer) => pointer - 1)
    }
  }

  return (
    <Card>
      <header className="flex justify-between items-center">
        <Link path="Readlist/1. Pending.base" icon="book-open">
          Read Later ({pending.length} pending)
        </Link>
        <AddReadLaterModal />
      </header>
      {target ? (
        <section className="flex items-center gap-2">
          <Button
            icon="step-forward"
            size="icon-xs"
            onClick={handleNext}
            tooltip="Next pending article"
          />
          ({pointer + 1}/{pending.length})
          <Link
            className="flex-1"
            href={target.value('url')?.toString() ?? ''}
            variant="plain"
            icon="square-arrow-out-up-right"
            tooltip={target.value('why')?.toString() ?? ''}
          >
            {target.$name}
          </Link>
          <Link
            variant="plain"
            path={target.$path}
            icon="info"
            tooltip={target.value('why')?.toString() ?? ''}
          />
          <Button
            icon="check"
            size="icon-xs"
            onClick={handleMarkAsDone}
            tooltip="Mark as done"
          />
        </section>
      ) : null}
    </Card>
  )
}
