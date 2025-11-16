import { useReducer } from 'preact/hooks'
import { Button } from '../components/shared/button'
import { Dialog, useDialog } from '../components/shared/dialog'
import { createFromTemplate } from '../utils/files'

type Album = {
  id: string
  name: string
  release_date: string
  artists: string[]
  images: Array<{
    url: string
    height: number
    width: number
  }>
  external_urls: { spotify: string }
  total_tracks: number
}

type State = {
  results: Array<Album>
  state: 'idle' | 'loading' | 'error' | 'success'
  selected: Album | null
}

type Action =
  | { type: 'loading' }
  | { type: 'setAlbums'; payload?: Array<Album> }
  | { type: 'selectAlbum'; payload: Album }

const contentTransformer = (source: Album) => (content: string) => {
  // frontmatter variables replacement
  return content
    .split('\n')
    .map((line) => {
      // TODO: Make this frontmatter modification more sofisticated
      return line
        .replace('year:', `year: ${source.release_date.split('-')[0]}`)
        .replace('album:', `album: ${source.external_urls.spotify}`)
        .replace('image:', `image: ${source.images[0].url}`)
        .replace(
          'artist:',
          `
artist:
${source.artists.map((artist) => `  - "[[${artist}]]"`).join('\n')}

              `
        )
    })
    .join('\n')
}

export const Music = () => {
  const { ref: dialogRef, close } = useDialog()

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'loading':
          return { ...state, state: 'loading' }
        case 'setAlbums':
          return {
            selected: null,
            state: 'success',
            results: action.payload ?? [],
          }
        case 'selectAlbum': {
          const isTheSameAlbum = action.payload.id === state.selected?.id

          return { ...state, selected: isTheSameAlbum ? null : action.payload }
        }
        default:
          return state
      }
    },
    {
      results: [],
      state: 'idle',
      selected: null,
    }
  )

  const handleSearch = async (e: Event) => {
    e.preventDefault()
    const target: HTMLFormElement = e.currentTarget as HTMLFormElement
    const form = new FormData(target)

    const searchTerm = form.get('albumName')?.toString().trim()

    if (!searchTerm) return

    dispatch({ type: 'loading' })

    const result = await fetch(
      `https://www.franbosquet.com/api/spotify?search=${encodeURIComponent(searchTerm)}&type=album`,
      {
        headers: {
          Authorization: 'branfostify',
        },
      }
    )

    if (result.status !== 200) {
      alert('Error leyendo la API. Comprueba la consola para más detalles.')
      return
    }

    const body: { albums: Array<Album> } = await result.json()

    dispatch({ type: 'setAlbums', payload: body.albums })
  }

  const handleSelect = (album: Album) => {
    dispatch({ type: 'selectAlbum', payload: album })
  }

  const handleCreate = async () => {
    const source = state.selected
    if (!source) return

    const fileName = `${source.artists[0]} - ${source.name}.md`
    const filePath = `Music/Albums/${fileName}`

    if (dc.app.vault.getFileByPath(filePath)) {
      alert('El album ya existe en el vault.')
      return
    }

    await createFromTemplate(filePath, 'album', contentTransformer(source))

    close()

    // navigate to the created file
    const file = dc.app.vault.getFileByPath(filePath)
    if (file) {
      dc.app.workspace.getLeaf(true).openFile(file)
    }
  }

  return (
    <div>
      <Dialog
        title="Añadir album"
        icon="disc"
        dialogRef={dialogRef}
        className="w-2xl max-w-screen"
      >
        <form className="flex gap-4 w-full" onSubmit={handleSearch}>
          <input className="flex-1" type="text" name="albumName" />
          <Button variant="secondary" type="submit">
            Buscar
          </Button>
        </form>
        <div
          className="grid grid-cols-auto-fit gap-1 mt-4"
          style={{ '--column-width': '60px' }}
        >
          {state.results.map((album) => {
            const smallestImage = album.images[album.images.length - 1]

            return (
              <button
                type="button"
                key={album.id}
                data-selected={state.selected?.id === album.id}
                className="flex flex-col cursor-pointer p-0 border-none h-auto bg-transparent data-[selected=true]:outline data-[selected=true]:outline-yellow-500"
                aria-label={album.name}
                onClick={() => handleSelect(album)}
              >
                <img
                  src={smallestImage.url}
                  alt={album.name}
                  className="object-cover"
                />
                <span className="text-sm overflow-hidden block w-full text-ellipsis">
                  {album.name}
                </span>
              </button>
            )
          })}
        </div>
        {state.selected && (
          <div className="mt-4">
            <h3>
              {state.selected.name} ({state.selected.release_date.split('-')[0]}
              )
            </h3>
            <p>{state.selected.artists.join(', ')}</p>
            <p>{state.selected.total_tracks} canciones</p>
            <Button onClick={handleCreate}>Guardar</Button>
          </div>
        )}
      </Dialog>
    </div>
  )
}
