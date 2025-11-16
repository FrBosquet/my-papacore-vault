export const getMusicAlbumWiki = async (artist: string, album: string, apiKey: string) => {
  const prompt = `informacion sobre el disco ${album} de ${artist}, incluyendo pequeña bio del artista y el contexto del album, en formato markdown con la cabecera mas alta siendo h3`

  const result = await fetch(
    `https://www.franbosquet.com/api/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    },
    body: JSON.stringify({
      search: prompt,
    }),
  })

  if (result.status !== 200) {
    console.error(result)
    throw new Error('Error leyendo la API. Comprueba la consola para más detalles.')
  }

  const response = await result.json()

  const wikiContent = response.data.choices[0].message.content

  return wikiContent
}
