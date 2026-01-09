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

export type GameInfo = {
  year: number
  image: string
  price: number
  metacritic: number
  hltb: number
}

export const getGameData = async (fileName: string, apiKey: string): Promise<GameInfo> => {
  const prompt = `Search only in steam.com, metacritic.com and howlongtobeat.com. Do not take any other source of information into account. Return a JSON with the data for the game ${fileName}. A valid JSON stringified with just the JSON, no other text. You should search in steam.com to get 'image' string for the game cover in the best resolution you can find, the 'year' integer for the year of release, the 'price' float for the game price in euros without discounts. You should go to metacritic.com to get the 'metacritic' float for the users game score from 0 to 100. You should go to howlongtobeat.com to get the 'hltb' float for the game duration. Do not visit other webs, thats the only source of information you need.
    `

  const result = await fetch('https://www.franbosquet.com/api/ask', {
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

  const jsonContent = response.data.choices[0].message.content

  try {
    return JSON.parse(jsonContent)
  } catch (error) {
    console.error(error)
    throw new Error('Error parsing the JSON response. Comprueba la consola para más detalles.')
  }
}