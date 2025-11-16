import type { Song } from "./utils"

export const SongList = ({ songs }: { songs: Song[] }) => {
  return <div>
    {
      songs.sort((a, b) => a.songTitle.localeCompare(b.songTitle)).map((song) => {
        return (
          <div className="flex gap-2 hover:bg-primary-700" key={song.page.$id}>
            <img src={song.albumImage} className="size-6" alt={song.albumName} />
            <a href={song.albumUrl} className="no-underline text-theme-contrast">{song.songTitle}</a>
            <span className="text-primary-600 [&_a]:no-underline [&_a]:text-primary-600 flex-1">
              <dc.Link link={song.page.$link}></dc.Link>
            </span>
            {
              song.songComment
                ? (
                  <button type="button" aria-label={song.songComment} className="bg-transparent border-none outline-none shadow-none w-auto flex- cursor-help">
                    <dc.Icon icon="info" />
                  </button>
                )
                : null
            }
          </div>
        )
      })
    }
  </div>
}