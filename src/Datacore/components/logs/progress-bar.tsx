import { classMerge } from '../../utils/classMerge'

interface Props {
  progressFn: string
  progressTarget: number
  index: number
  value?: number
  prevValue?: number
  daysPassed: number
  className?: string
}

export const ProgressBar = ({
  progressFn,
  progressTarget,
  index,
  value,
  prevValue,
  daysPassed,
  className,
}: Props) => {
  if (!progressFn) return null

  const cname = classMerge(
    'text-xs uppercase block shrink-0 text-0 p-1 text-contrast-300 justify-self-end',
    className
  )

  switch (progressFn) {
    case 'days': {
      return (
        <span className={cname}>
          {daysPassed} / {progressTarget}
        </span>
      )
    }
    case 'count':
      return (
        <span className={cname}>
          {index} / {progressTarget}
        </span>
      )
    case 'value': {
      const progress = (value ?? 0) - (prevValue ?? 0)

      return (
        <span className={cname}>
          <strong>+{progress}</strong> {value} / {progressTarget}
        </span>
      )
    }
    default:
      return null
  }
}
