import { useContext, useEffect, useState } from 'react'
import AuthContext from '../auth'
import { GlobalStoreContext } from '../store'

import IconButton from '@mui/material/IconButton'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import CloseIcon from '@mui/icons-material/Close'

/**
 * Status bar / mini player at the bottom.
 * Shows the currently “playing” playlist and lets you move
 * prev/next, pause/resume, or close the mini player.
 */
function Statusbar() {
  const { auth } = useContext(AuthContext)
  const { store } = useContext(GlobalStoreContext)

  // Local UI state just for play/pause icon
  const [isPlaying, setIsPlaying] = useState(false)

  // We only care about the dedicated playing playlist
  const playlist = store.playingList
  const songs = playlist?.songs || []
  const hasActivePlaylist = !!playlist && songs.length > 0

  // When a playlist starts/stops, reset the play/pause icon
  useEffect(() => {
    if (hasActivePlaylist) {
      setIsPlaying(true)
    } else {
      setIsPlaying(false)
    }
  }, [hasActivePlaylist])

  // If not logged in OR nothing is playing → render nothing
  if (!auth.loggedIn || !hasActivePlaylist) {
    return null
  }

  // Use the index that the store updates (next/prev)
  const songIndex = store.playingIndex >= 0 ? store.playingIndex : 0
  const currentSong = songs[songIndex] || null

  const handlePrev = () => {
    if (store.playPreviousSong) {
      store.playPreviousSong()
    }
  }

  const handleNext = () => {
    if (store.playNextSong) {
      store.playNextSong()
    }
  }

  const handleTogglePlayPause = () => {
    // Just toggle the icon colour / state for now
    setIsPlaying(prev => !prev)
  }

  const handleClose = () => {
    // Clear player in the store so the bar disappears
    if (store.stopPlaying) {
      store.stopPlaying()
    }
    setIsPlaying(false)
  }

  // Nice readable text: Playlist — Song (Year) by Artist
  let label = playlist.name
  if (currentSong) {
    const parts = []
    if (currentSong.title) parts.push(currentSong.title)
    if (currentSong.year) parts.push(`(${currentSong.year})`)
    if (currentSong.artist) parts.push(`by ${currentSong.artist}`)
    label = `${playlist.name} — ${parts.join(' ')}`
  }

  return (
    <div
      id="playlister-statusbar"
      style={{
        backgroundColor: 'rgb(0,127,255)', // always blue when visible
        color: 'white',
        gap: '2rem',
        padding: '0 2rem',
      }}
    >
      <IconButton
        aria-label="previous song"
        onClick={handlePrev}
        size="large"
      >
        <SkipPreviousIcon fontSize="large" />
      </IconButton>

      <IconButton
        aria-label={isPlaying ? 'pause playlist' : 'play playlist'}
        onClick={handleTogglePlayPause}
        size="large"
      >
        {isPlaying ? (
          <PauseIcon fontSize="large" />
        ) : (
          <PlayArrowIcon fontSize="large" />
        )}
      </IconButton>

      <div style={{ flexGrow: 1, textAlign: 'center' }}>
        {label}
      </div>

      <IconButton
        aria-label="next song"
        onClick={handleNext}
        size="large"
      >
        <SkipNextIcon fontSize="large" />
      </IconButton>

      <IconButton
        aria-label="close player"
        onClick={handleClose}
        size="large"
      >
        <CloseIcon fontSize="large" />
      </IconButton>
    </div>
  )
}

export default Statusbar
