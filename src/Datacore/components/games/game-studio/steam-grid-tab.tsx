import { Button } from '../../shared/button'
import { useDebouncedState } from './use-debounced-state'

interface Props {
  name: string
  injectValue: (field: 'name' | 'year' | 'image', value: string) => void
  formData: Record<string, string>
  apiKey: string
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

export const SteamGridTab = ({ name, injectValue, formData, apiKey }: Props) => {
  const value = useDebouncedState(name)

  const [selectedGame, setSelectedGame] = dc.useState<GameOption | undefined>(
    undefined
  )
  const [gameOptions, setGameOptions] = dc.useState<GameOption[]>([])

  const [gameAssets, setGameAssets] = dc.useState<GameAsset[]>([])

  const fetchForGame = async (v: string) => {
    if (!v.length) return
    const response = await requestUrl({
      url: `${BASE_URL}/search/autocomplete/${v}`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const content = response.json.data

    setSelectedGame(content[0])
    setGameOptions(content)
  }

  const fetchGameAssets = async (gameId: number) => {
    const response = await requestUrl({
      url: `${BASE_URL}/grids/game/${gameId}`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const content = response.json.data

    setGameAssets(content)
  }

  dc.useEffect(() => {
    fetchForGame(value)
  }, [value])

  dc.useEffect(() => {
    if (selectedGame) {
      fetchGameAssets(selectedGame.id)
    }
  }, [selectedGame])

  if (!value.length) return <p>Add a name first</p>

  const year = selectedGame?.release_date
    ? new Date(selectedGame.release_date * 1000).getFullYear().toString()
    : ''

  return (
    <div className="w-full h-full overflow-y-scroll flex flex-col gap-2">
      <select
        className="w-full"
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
          const releaseDate = game['release_date']
            ? new Date(game['release_date'] * 1000).getFullYear()
            : null

          return (
            <option value={game.id}>
              {releaseDate ? `${releaseDate} - ` : ''} {game.name}
            </option>
          )
        })}
      </select>
      {selectedGame && (
        <Button
          icon="arrow-big-left"
          className="justify-start"
          onClick={() => injectValue('name', selectedGame.name)}
          disabled={formData.name === selectedGame.name}
        >
          {selectedGame.name} - Copy to form
        </Button>
      )}
      {selectedGame?.release_date ? (
        <Button
          disabled={formData.year === year}
          icon="arrow-big-left"
          className="justify-start"
          onClick={() => injectValue('year', year)}
        >
          {year} - Copy to form
        </Button>
      ) : null}
      {gameAssets?.length > 0 ? (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] justify-center items-center gap-2 w-full">
          {gameAssets.map((asset) => (
            <Button
              variant="ghost"
              onClick={() => injectValue('image', asset.thumb)}
            >
              <img src={asset.thumb} alt="Game grid poster" />
            </Button>
          ))}
        </section>
      ) : null}
    </div>
  )
}
