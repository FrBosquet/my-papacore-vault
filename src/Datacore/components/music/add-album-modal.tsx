import { useReducer } from 'preact/hooks'
import type { ContentTransformer } from '../../utils/ContentTransformer'
import { createFromTemplate, fileExists, getFile } from '../../utils/files'
import { getMusicAlbumWiki } from '../../utils/perplexity'
import type { Album } from '../../utils/spotify'
import { searchAlbums } from '../../utils/spotify'
import { Button } from '../shared/button'
import { Dialog, useDialog } from '../shared/dialog'

type State = {
  results: Array<Album>
  state: 'idle' | 'loading' | 'loading-wiki' | 'error' | 'success'
  selected: Album | null
}

type Action =
  | { type: 'loading' }
  | { type: 'setAlbums'; payload?: Array<Album> }
  | { type: 'selectAlbum'; payload: Album }
  | { type: 'abort' }
  | { type: 'loading-wiki' }

const contentTransformer = (source: Album, reason: string, wikiContent: string) => (content: ContentTransformer) => {
  content.setFrontmatter('year', source.release_date.split('-')[0])
  content.setFrontmatter('album', source.external_urls.spotify)
  content.setFrontmatter('image', source.images[0].url)
  content.setFrontmatter('artist', source.artists.map((artist) => `[[${artist}]]`))

  // If the first line is an h3, remove it and 
  let cleanContent = wikiContent.split('\n')

  if (cleanContent[0].startsWith('###')) {
    cleanContent = cleanContent.slice(1)

    if (cleanContent[0].length === 0) {
      cleanContent = cleanContent.slice(1)
    }
  }

  content.insertInSection('wiki', cleanContent.join('\n'))

  if (reason.length > 0) {
    content.insertInSection('My take', reason)
  }

  return content
}

type Props = {
  apiKey: string
}

export const AddAlbumModal = ({ apiKey }: Props) => {
  const { ref: dialogRef, close } = useDialog()

  const [state, dispatch] = useReducer(
    (state: State, action: Action): State => {
      switch (action.type) {
        case 'loading':
          return { ...state, state: 'loading' }
        case 'loading-wiki':
          return { ...state, state: 'loading-wiki' }
        case 'abort':
          return { ...state, state: state.results.length > 0 ? 'success' : 'idle' }
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

    try {
      const result = await searchAlbums(searchTerm, apiKey)

      dispatch({ type: 'setAlbums', payload: result })
    } catch (error) {
      dispatch({ type: 'abort' })
      alert(error instanceof Error ? error.message : error)
      return
    }
  }

  const handleSelect = (album: Album) => {
    dispatch({ type: 'selectAlbum', payload: album })
  }

  const handleCreate = async (e: Event) => {
    e.preventDefault()
    const target: HTMLFormElement = e.currentTarget as HTMLFormElement
    const form = new FormData(target)

    const reason = form.get('reason')?.toString().trim()

    const source = state.selected
    if (!source) return

    const fileName = `${source.artists[0]} - ${source.name}.md`
    const filePath = `Music/Albums/${fileName}`

    if (fileExists(filePath)) {
      alert('El album ya existe en el vault.')
      return
    }

    try {

      const artist = source.artists[0]
      const title = source.name

      dispatch({ type: 'loading-wiki' })

      const wiki = await getMusicAlbumWiki(artist, title, apiKey)

      // create the artist files if they don't exist
      const artists = source.artists

      for (const artist of artists) {
        const artistPath = `Music/Artists/${artist}.md`

        if (!fileExists(artistPath)) {
          await createFromTemplate(artistPath, 'artist')
        }
      }

      await createFromTemplate(filePath, 'album', contentTransformer(source, reason ?? '', wiki))

      dispatch({ type: 'abort' })
      close()

      // navigate to the created file
      const file = getFile(filePath)
      if (file) {
        dc.app.workspace.getLeaf(true).openFile(file)
      }
    } catch (error) {
      dispatch({ type: 'abort' })
      alert(error instanceof Error ? error.message : error)
    }
  }

  const isLoading = state.state.includes('loading')

  const notSearched = state.state === 'idle' || state.state === 'loading'

  return (
    <Dialog
      title="Añadir album"
      icon="disc"
      dialogRef={dialogRef}
      className="w-2xl max-w-screen"
      triggerProps={{
        size: 'sm',
      }}
    >
      <form className="flex gap-4 w-full" onSubmit={handleSearch}>
        <input className="flex-1" type="text" name="albumName" />
        <Button variant="secondary" size="icon" type="submit" isLoading={isLoading} icon="search" />
      </form>
      <div
        className="grid grid-cols-auto-fit gap-1 mt-4"
        style={{ '--column-width': '60px' }}
      >
        {notSearched
          ? <p className="text-primary-600 py-4 text-center w-full">{
            state.state === 'loading'
              ? 'Buscando album...'
              : 'Empieza buscando un album'
          }</p>
          : state.results.map((album) => {
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
                  className="object-cover aspect-square"
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
          <h3 className="mb-1">
            {state.selected.name} ({state.selected.release_date.split('-')[0]}
            )
          </h3>
          <div className="flex gap-2 w-full">
            <p className="text-primary-300">{state.selected.artists.join(', ')}</p>
            <p className="text-primary-600 flex-1">{state.selected.total_tracks} canciones</p>
          </div>
          <form onSubmit={handleCreate} className="flex gap-2 w-full pt-4">
            <label htmlFor="reason" className="text-xs uppercase text-primary-700">Razón:</label>
            <input type="text" name="reason" className="flex-1" />
            <Button type="submit" isLoading={isLoading} iconRight='save'>
              Añadir
            </Button>
          </form>
        </div>
      )}
    </Dialog>
  )
}
