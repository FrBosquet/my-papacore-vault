const Icons = [
  'folder-kanban',
  'gamepad',
  'gamepad-2',
  'headphones',
  'disc',
  'disc-2',
  'disc-3',
  'star',
  'user',
  'user-round',
  'brush-cleaning',
  'shell',
  'trash'
] as const

export type IconName = typeof Icons[number]

