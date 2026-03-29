export const ProgressBar = ({ progress }: { progress: number }) => {
  const str = `${(progress * 100).toFixed(0)}%`

  return (
    <article className="w-full text-primary-300 flex gap-2 items-center">
      <aside className="bg-primary-950/50 flex-1 h-1">
        <div className="h-full bg-primary-200" style={{ width: str }} />
      </aside>
      <p className="text-xs font-semibold w-6 shrink-0 text-right">{str}</p>
    </article>
  )
}
