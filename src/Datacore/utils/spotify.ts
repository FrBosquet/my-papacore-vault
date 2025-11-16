export type Album = {
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

export const searchAlbums = async (searchTerm: string, apiKey: string) => {
  const result = await fetch(
    `https://www.franbosquet.com/api/spotify?search=${encodeURIComponent(searchTerm)}&type=album`, {
    headers: {
      Authorization: apiKey,
    },
  })

  if (result.status !== 200) {
    console.error(result)
    throw new Error('Error leyendo la API. Comprueba la consola para más detalles.')
  }

  const body: { albums: Array<Album> } = await result.json()

  return body.albums
}
