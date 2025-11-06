import type { IconName } from '../../../icons'

const workoutTooltip = `Incluye:
- Hacer ejercicio en el gimnasio
- Salir a correr
- Actividad física (Senderismo, etc)
- Challenge físico (Pushups, crunches, etc)
`

const wateringTooltip = `Incluye:
- Rellenar las botellas de agua
`

const focusWorkTooltip = `Incluye:
- Poner música de fondo
- Tomar una tarea de las planificadas para el día
- Arrancar el servidor de trabajo y claude
- Trabajar
`

const pullRequestTooltip = `Incluye:
- Revisar mis PRs abiertas y pedir/repedir/corregir revisiones
- Revisar PRs en canales de DPX
`

const updatePullRequestsTooltip = `Incluye:
- Actualizar todas mis PRs con los últimos cambios en preprod
`

type HabitConfig = {
  icon: IconName
  label: string
  category: 'personal' | 'work'
  highlight: boolean
  tooltip?: string
}

export const habitConfig: Record<string, HabitConfig> = {
  Workout: {
    icon: 'biceps-flexed',
    label: 'Workout',
    category: 'personal',
    highlight: false,
    tooltip: workoutTooltip,
  },
  MakeBed: {
    icon: 'bed',
    label: 'Make Bed',
    category: 'personal',
    highlight: false,
  },
  Meditate: {
    icon: 'brain',
    label: 'Meditate',
    category: 'personal',
    highlight: false,
  },
  Reading: {
    icon: 'book',
    label: 'Reading',
    category: 'personal',
    highlight: false,
  },
  Planning: {
    icon: 'calendar',
    label: 'Planning',
    category: 'work',
    highlight: false,
  },
  Email: {
    icon: 'mail',
    label: 'Email',
    category: 'work',
    highlight: false,
  },
  Pills: {
    icon: 'pill',
    label: 'Pills',
    category: 'personal',
    highlight: false,
  },
  Feeding: {
    icon: 'apple',
    label: 'Proper Feeding',
    category: 'personal',
    highlight: false,
  },
  Watering: {
    icon: 'droplet',
    label: 'Watering',
    category: 'personal',
    highlight: false,
    tooltip: wateringTooltip,
  },
  HouseKeeping: {
    icon: 'house',
    label: 'House Keeping',
    category: 'personal',
    highlight: false,
  },
  CleanSocial: {
    icon: 'paintbrush',
    label: 'Clean Social',
    category: 'personal',
    highlight: false,
  },
  SelfGrow: {
    icon: 'sprout',
    label: 'Self Growth',
    category: 'personal',
    highlight: false,
  },
  WritingTrain: {
    icon: 'keyboard',
    label: 'Writing Train',
    category: 'work',
    highlight: false,
  },
  UpdatePRs: {
    icon: 'git-pull-request',
    label: 'Update PRs',
    category: 'work',
    highlight: false,
    tooltip: updatePullRequestsTooltip,
  },
  Writting: {
    icon: 'pencil',
    label: 'Writing',
    category: 'personal',
    highlight: false,
  },
  SideProjects: {
    icon: 'square-kanban',
    label: 'Side Projects',
    category: 'personal',
    highlight: false,
  },
  Playtime: {
    icon: 'gamepad',
    label: 'Play Time',
    category: 'personal',
    highlight: false,
  },
  Ears: {
    icon: 'ear',
    label: 'Clean Ears',
    category: 'personal',
    highlight: false,
  },
  Nails: {
    icon: 'hand',
    label: 'Maintain Nails',
    category: 'personal',
    highlight: false,
  },
  Slack: {
    icon: 'slack',
    label: 'Slack',
    category: 'work',
    highlight: false,
  },
  Focus: {
    icon: 'lamp-desk',
    label: 'Focus work',
    category: 'work',
    highlight: false,
    tooltip: focusWorkTooltip,
  },
  PRs: {
    icon: 'git-pull-request',
    label: 'PRs',
    category: 'work',
    highlight: false,
    tooltip: pullRequestTooltip,
  },
  Reseting: {
    icon: 'repeat-2',
    label: 'Resetting',
    category: 'personal',
    highlight: false,
  },
  Challenging: {
    icon: 'swords',
    label: 'Challenging',
    category: 'personal',
    highlight: false,
  },
  catNest: {
    icon: 'cat',
    label: 'Cat Nest',
    category: 'personal',
    highlight: false,
  },
}
