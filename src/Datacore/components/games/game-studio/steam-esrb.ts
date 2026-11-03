const ESRB_LABELS: Record<string, string> = {
  e: 'E',
  e10: 'E10+',
  ec: 'EC',
  t: 'T',
  m: 'M',
  ao: 'AO',
  rp: 'RP',
}

/** "m", "M", and "e10" all become the label shown in the form. */
export const normalizeEsrb = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const key = value.trim().toLowerCase().replace(/\s+/g, '').replace(/\+/g, '')
  return ESRB_LABELS[key]
}

/**
 * Steam's app details include an ESRB block when the request asks for the US
 * store. HowLongToBeat leaves `rating_esrb` empty for plenty of games that
 * Steam has rated, such as Red Dead Redemption 2.
 */
export const steamAppDetailsUrl = (appId: string) =>
  `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=english`

export const esrbFromAppDetails = (
  payload: unknown,
  appId: string
): string | undefined => {
  if (!payload || typeof payload !== 'object') return undefined
  const entry = (payload as Record<string, unknown>)[appId]
  if (!entry || typeof entry !== 'object') return undefined
  if ((entry as { success?: unknown }).success === false) return undefined

  const rating = (
    entry as { data?: { ratings?: { esrb?: { rating?: unknown } } } }
  ).data?.ratings?.esrb?.rating
  return normalizeEsrb(rating)
}

export const fetchSteamEsrb = async (
  appId: string
): Promise<string | undefined> => {
  if (!/^\d+$/.test(appId)) return undefined
  const response = await requestUrl({ url: steamAppDetailsUrl(appId) })
  return esrbFromAppDetails(response.json, appId)
}
