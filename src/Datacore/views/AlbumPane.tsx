import { months } from '../components/music/utils'
import { Button } from '../components/shared/button'
import { useFrontmatterState } from '../hooks/markdown'
import { getFile, getLeaf } from '../utils/files'
import { playSpotifyUrl, toSpotifyUri } from '../utils/spotify'
import { getTodayDatetime } from '../utils/time'

const STARS = [1, 2, 3, 4, 5] as const

const getCurrentListeningPeriod = () => {
  const today = getTodayDatetime()
  return `${today.year} ${months[today.month - 1]}`
}

export const AlbumPane = () => {
  const currentPeriod = getCurrentListeningPeriod()
  const [listening, setListening] = useFrontmatterState<string>('Listening')
  const [albumUrl] = useFrontmatterState<string>('album')
  const [rawRating, setRating] = useFrontmatterState<number>('My rating')
  const rating = Number(rawRating) || 0
  const isThisMonth = listening === currentPeriod
  const canPlay = Boolean(albumUrl && toSpotifyUri(albumUrl))

  return (
    <menu className="flex justify-start gap-3 px-2 py-2 items-center w-full bg-primary-950">
      <Button
        size="icon-xs"
        variant="ghost"
        icon="house"
        tooltip="Hub"
        className="text-theme-accent hover:bg-theme-accent hover:text-primary-950"
        onClick={(e) => {
          const file = getFile('Music/Hub.md')
          if (file) getLeaf(e.ctrlKey || e.metaKey).openFile(file)
        }}
      />
      <Button
        size="icon-xs"
        icon="play"
        disabled={!canPlay}
        onClick={() => {
          if (albumUrl) {
            playSpotifyUrl(albumUrl)
          }
        }}
      />
      <Button
        size="sm"
        icon={isThisMonth ? 'calendar-check' : 'calendar-plus'}
        disabled={isThisMonth}
        onClick={() => setListening(currentPeriod)}
      >
        Este mes
      </Button>
      <div className="flex-1" />
      <div className="flex">
        {STARS.map((value) => (
          <Button
            key={value}
            variant="ghost"
            size="icon-xs"
            icon="star"
            tooltip={`${value}`}
            className={value <= rating ? 'text-yellow-200' : 'text-primary-600'}
            onClick={() => setRating(rating === value ? undefined : value)}
          />
        ))}
      </div>
    </menu>
  )
}
