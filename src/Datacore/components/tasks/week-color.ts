const WEEK_COLOR_CLASSES = [
  'bg-rose-400 text-rose-950',
  'bg-orange-400 text-orange-950',
  'bg-amber-300 text-amber-950',
  'bg-emerald-400 text-emerald-950',
  'bg-cyan-400 text-cyan-950',
  'bg-blue-400 text-blue-950',
  'bg-violet-400 text-violet-950',
  'bg-fuchsia-400 text-fuchsia-950',
] as const

export const getWeekColorClass = (week: number) =>
  WEEK_COLOR_CLASSES[week % WEEK_COLOR_CLASSES.length]
