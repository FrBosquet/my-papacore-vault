const shimmerGradient =
  'bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-contrast-700)_18%,transparent),color-mix(in_srgb,var(--color-contrast-400)_28%,transparent),color-mix(in_srgb,var(--color-contrast-200)_16%,transparent),transparent)]'

export const ongoingTaskShimmerClassName = [
  'pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-md contain-paint',
].join(' ')

export const ongoingTaskShimmerBandClassName = [
  'absolute inset-0 animate-shimmer',
  shimmerGradient,
].join(' ')

export const ongoingTaskClassName = [
  'relative isolate overflow-hidden bg-primary-950',
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:content-['']",
  'before:animate-shimmer',
  'before:bg-[linear-gradient(90deg,transparent_25%,color-mix(in_srgb,var(--color-contrast-400)_8%,transparent)_42%,color-mix(in_srgb,var(--color-contrast-200)_20%,transparent)_50%,color-mix(in_srgb,var(--color-contrast-400)_8%,transparent)_58%,transparent_75%)]',
].join(' ')
