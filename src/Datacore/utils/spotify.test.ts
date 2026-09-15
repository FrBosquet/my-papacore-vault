import { toSpotifyUri } from './spotify'

describe('toSpotifyUri', () => {
  it('converts an album URL to a Spotify URI', () => {
    expect(
      toSpotifyUri('https://open.spotify.com/album/3nehlgwYexH9ovS9fohKs1')
    ).toBe('spotify:album:3nehlgwYexH9ovS9fohKs1')
  })

  it('strips locale prefixes, quotes, and share query params', () => {
    expect(
      toSpotifyUri(
        '"https://open.spotify.com/intl-es/album/6jRvDpOc9oi3sjQuoPK7if?si=abc"'
      )
    ).toBe('spotify:album:6jRvDpOc9oi3sjQuoPK7if')
  })

  it('converts playlist URLs', () => {
    expect(
      toSpotifyUri(
        'https://open.spotify.com/playlist/096Cemg1Aeyx82eN3FV3Nz?si=373b7295a4dc47bb'
      )
    ).toBe('spotify:playlist:096Cemg1Aeyx82eN3FV3Nz')
  })

  it('returns undefined for empty or unknown URLs', () => {
    expect(toSpotifyUri('')).toBeUndefined()
    expect(toSpotifyUri('https://example.com')).toBeUndefined()
  })
})
