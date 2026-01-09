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
  metacriticDataUrl: string
  hltbDataUrl: string
  dataUrl: string
}

export const getGameData = async (fileName: string, apiKey: string): Promise<GameInfo> => {
  const prompt = `Return a JSON with the data for the game ${fileName}. A valid JSON stringified with just the JSON, no other text.
  
  You should search in steam.com for the 'year' integer for the year of release, the 'price' float for the game price in euros without discounts. If the game is not listed in steam, look for other sources of information to get the year and price. Provide a dataUrl string with a link with the page of the store where you found the information.
  
  You should get 'image' string for the game cover in the best resolution you can find. If its an steam game, try to get the image from steam.com domain. If its not a steam game, try to get the image from upload.wikimedia.com domain. If both fails, try to get the image from howlongtobeat.com domain. Don't made up the strings, actually search for references to the URI. If all fails, return null, never return an string from any other domain.

  You should go to metacritic.com to get the 'metacritic' float for the users game score from 0 to 100. No other source is valid for the metacritic score. If you can find the score, just return null. Provide a metacriticDataUrl string with a link with the page of the store where you found the information.
  
  You should go to howlongtobeat.com to get the 'hltb' float for the game duration. Do not visit other webs, thats the only source of information you need for completion time. Provide a hltbDataUrl string with a link to the howlongtobat page where you found the information. Make sure the url points to the right game page, not any other game's page.
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
    const json = JSON.parse(jsonContent)

    console.log(json)

    if (json.error) {
      throw new Error(json.error)
    }

    return json
  } catch (error) {
    console.error(error)
    throw new Error(error instanceof Error ? error.message : 'Error parsing the JSON response. Comprueba la consola para más detalles.')
  }
}