import { useEnvVar } from '../../../utils/envvars'
import { Button } from '../../shared/button'
import { closestWidescreenAsset } from './steam-grid-image'
import { useDebouncedState } from './use-debounced-state'

export type SteamSuggestions = {
  name?: string
  year?: string
  image?: string
  clear?: boolean
}

interface Props {
  name: string
  injectValue: (field: 'image', value: string) => void
  isEditing: boolean
  onSuggest: (suggestions: SteamSuggestions) => void
}

const BASE_URL = 'https://www.steamgriddb.com/api/v2'

type GameOption = {
  id: number
  name: string
  release_date: number
}

type GameAsset = {
  id: number
  width: number
  height: number
  url: string
  thumb: string
}

export const SteamGridTab = ({
  name,
  injectValue,
  isEditing,
  onSuggest,
}: Props) => {
  const apiKey = useEnvVar('steamGridApiKey')

  const value = useDebouncedState(name)
  const onSuggestRef = dc.useRef(onSuggest)

  const [selectedGame, setSelectedGame] = dc.useState<GameOption | undefined>(
    undefined
  )
  const [gameOptions, setGameOptions] = dc.useState<GameOption[]>([])

  const [gameAssets, setGameAssets] = dc.useState<GameAsset[]>([])
  const [assetsFor, setAssetsFor] = dc.useState<number | undefined>(undefined)

  onSuggestRef.current = onSuggest

  const searchRequest = dc.useRef(0)
  const assetsRequest = dc.useRef(0)

  const fetchForGame = async (v: string) => {
    if (!v.length) return
    const request = ++searchRequest.current
    const response = await requestUrl({
      url: `${BASE_URL}/search/autocomplete/${v}`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (request !== searchRequest.current) return
    const content = response.json.data
    setSelectedGame(content?.[0])
    setGameOptions(content ?? [])
  }

  const fetchGameAssets = async (gameId: number) => {
    const request = ++assetsRequest.current
    const response = await requestUrl({
      url: `${BASE_URL}/grids/game/${gameId}`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (request !== assetsRequest.current) return
    const content = response.json.data
    setGameAssets(content ?? [])
    setAssetsFor(gameId)
  }

  dc.useEffect(() => {
    if (!value.trim()) {
      setSelectedGame(undefined)
      setGameOptions([])
      setGameAssets([])
      setAssetsFor(undefined)
      return
    }

    fetchForGame(value)
  }, [value])

  dc.useEffect(() => {
    if (!selectedGame?.id) return
    fetchGameAssets(selectedGame.id)
  }, [selectedGame?.id])

  const year = selectedGame?.release_date
    ? new Date(selectedGame.release_date * 1000).getFullYear().toString()
    : ''
  const image =
    assetsFor === selectedGame?.id
      ? closestWidescreenAsset(gameAssets)?.thumb
      : undefined

  dc.useEffect(() => {
    if (!value.trim()) {
      onSuggestRef.current({ clear: true })
      return
    }

    if (!selectedGame) return

    onSuggestRef.current({
      ...(isEditing ? {} : { name: selectedGame.name }),
      year,
      image: image ?? '',
    })
  }, [value, isEditing, selectedGame?.id, selectedGame?.name, year, image])

  if (!value.length)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-primary-500 uppercase">Add a name first</p>
      </div>
    )

  const visibleAssets = assetsFor === selectedGame?.id ? gameAssets : []

  return (
    <div className="w-full h-full overflow-y-scroll flex flex-col gap-2">
      <select
        className="w-full my-4"
        value={selectedGame?.id}
        onChange={(e) =>
          setSelectedGame(
            gameOptions.find(
              (game) => game.id === Number(e.currentTarget.value)
            )
          )
        }
      >
        {gameOptions.map((game) => {
          const releaseDate = game.release_date
            ? new Date(game.release_date * 1000).getFullYear()
            : null

          return (
            <option value={game.id}>
              {releaseDate ? `${releaseDate} - ` : ''} {game.name}
            </option>
          )
        })}
      </select>
      {visibleAssets.length > 0 ? (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] justify-center items-center gap-2 w-full">
          {visibleAssets.map((asset) => (
            <Button
              variant="ghost"
              onClick={() => injectValue('image', asset.thumb)}
            >
              <img
                src={asset.thumb}
                alt="Game grid poster"
                className="max-h-[200px] max-w-full object-contain"
              />
            </Button>
          ))}
        </section>
      ) : null}
    </div>
  )
}
