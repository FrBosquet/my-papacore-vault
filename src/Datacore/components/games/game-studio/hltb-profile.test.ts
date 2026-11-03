import {
  parseHltbProfileRead,
  profileFromGameHtml,
  profileFromGameRecord,
  readHltbGamePage,
} from './hltb-profile'

const witcher = {
  profile_dev: 'CD Projekt RED',
  profile_pub: 'CD Projekt, Warner Bros. Interactive Entertainment',
  release_world: '2015-05-19',
  release_na: '2015-05-19',
  release_eu: '2015-05-19',
  rating_esrb: 'M',
}

describe('profileFromGameRecord', () => {
  it('maps the HLTB game record', () => {
    expect(profileFromGameRecord(witcher)).toEqual({
      developer: 'CD Projekt RED',
      editor: 'CD Projekt, Warner Bros. Interactive Entertainment',
      released: '2015-05-19',
      esrb: 'M',
    })
  })

  it('falls back to a regional date when the world date is only a year', () => {
    expect(
      profileFromGameRecord({
        profile_dev: 'Supergiant Games',
        release_world: '2020',
        release_na: '2020-09-17',
        rating_esrb: '',
      })
    ).toEqual({
      developer: 'Supergiant Games',
      editor: undefined,
      released: '2020-09-17',
      esrb: undefined,
    })
  })

  it('keeps the Steam app id when HowLongToBeat has no ESRB', () => {
    expect(
      profileFromGameRecord({
        profile_dev: 'Rockstar Studios',
        profile_steam: 1174180,
        rating_esrb: '',
      })
    ).toEqual({
      developer: 'Rockstar Studios',
      editor: undefined,
      released: undefined,
      esrb: undefined,
      steamAppId: '1174180',
    })
  })

  it('returns undefined when the record has none of the tracked fields', () => {
    expect(profileFromGameRecord({})).toBeUndefined()
  })
})

describe('profileFromGameHtml', () => {
  it('reads the game out of __NEXT_DATA__', () => {
    const html = `<html><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(
      { props: { pageProps: { game: { data: { game: [witcher] } } } } }
    )}</script></html>`

    expect(profileFromGameHtml(html)).toEqual({
      found: true,
      profile: {
        developer: 'CD Projekt RED',
        editor: 'CD Projekt, Warner Bros. Interactive Entertainment',
        released: '2015-05-19',
        esrb: 'M',
      },
    })
  })

  it('reports a miss when the page has no game payload', () => {
    expect(profileFromGameHtml('<html></html>')).toEqual({ found: false })
    expect(profileFromGameHtml(null)).toEqual({ found: false })
  })
})

describe('parseHltbProfileRead', () => {
  it('parses a profile payload from the game page', () => {
    expect(parseHltbProfileRead(JSON.stringify(witcher))?.profile?.esrb).toBe(
      'M'
    )
  })

  it('parses the top search hit id', () => {
    expect(parseHltbProfileRead('{"gameId":"10270"}')).toEqual({
      profile: undefined,
      gameId: '10270',
    })
  })

  it('rejects an id that is not digits', () => {
    expect(parseHltbProfileRead('{"gameId":"../10270"}')).toBeUndefined()
    expect(parseHltbProfileRead('not json')).toBeUndefined()
  })
})

describe('readHltbGamePage', () => {
  it('fetches that game page from inside the HLTB view', () => {
    expect(readHltbGamePage('10270')).toBe(
      "fetch('/game/10270').then((response) => response.text())"
    )
  })

  it('refuses to interpolate an unsafe id', () => {
    expect(() => readHltbGamePage('10270;alert(1)')).toThrow(
      'Invalid HLTB game id'
    )
  })
})
