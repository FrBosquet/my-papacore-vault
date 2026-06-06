export const getInstantGamingUrl = (name: string) => {
  return `https://www.instant-gaming.com/es/busquedas/?query=${encodeURIComponent(name)}`
}

export const getMetacriticUrl = (name: string) => {
  return `https://www.metacritic.com/search/${encodeURIComponent(name)}`
}

export const getHLTBUrl = (name: string) => {
  return `https://howlongtobeat.com/?q=${encodeURIComponent(name)}`
}
