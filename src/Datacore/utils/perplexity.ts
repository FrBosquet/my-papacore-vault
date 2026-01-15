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

export type GameData = {
  year: number
  price: number
  image: string[]
  howlongtobeat: number
  metacritic: number
  metacriticDataUrl: string
  howLongToBeatUrl: string
  dataUrl: string
}

export const getGameData = async (gameName: string, apiKey: string): Promise<GameData> => {
  const system = `Eres un experto en videojuegos que maneja gran cantidad de información.
  
  Para la puntuación de los juegos solo te fias de metacritic.com y la das de 0 a 100. La devuelves como el número 'metacritic' y la URL de la página de metacritic como 'metacriticDataUrl'.
  
  Para la duración, solo te fias de howlongtobeat.com y la das en horas. La devuelves como el número 'howlongtobeat' y la URL de la página de howlongtobeat como 'howLongToBeatUrl'.
  
  Para las imágenes buscas varias URIs de imágenes del juego, al menos 10, y las das en un array de strings. La devuelves como el array 'image'. Prefieres imágenes que encuentras en cloudflare.
  
  Para el año de lanzamiento, buscas la información en la web y la das como el número 'year'.
  
  Para el precio, buscas la información en la web y la das como el número 'price' prefiriendo steam.com pero puedes dar otras páginas.
  
  Para la URL de la página del juego, prefieres buscar en steam.com, pero puedes dar otras página. Buscas la información en la web y la das como la string 'dataUrl'.
  `

  const content = `Informacion sobre el juego ${gameName} `

  const result = await fetch('https://www.franbosquet.com/api/ask/structured', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
    },
    body: JSON.stringify({
      content,
      system,
      mode: 'sonar',
      schema: {
        "year": "number",
        "price": "float",
        "image": "string[]",
        "howlongtobeat": "number",
        "metacritic": "number",
        "metacriticDataUrl": "string",
        "howLongToBeatUrl": "string",
        "dataUrl": "string"
      }
    }),
  })

  return result.json()
}