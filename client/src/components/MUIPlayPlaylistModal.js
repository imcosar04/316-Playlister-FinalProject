import React, { useContext } from 'react';
import { GlobalStoreContext } from '../store';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function MUIPlayPlaylistModal() {
  const { store } = useContext(GlobalStoreContext);

  const open = store.isPlayPlaylistModalOpen
    ? store.isPlayPlaylistModalOpen()
    : false;

  function handleClose() {
    store.hideModals();
  }

  if (!open) return null;

  const playlist = store.currentList;
  const songs = playlist?.songs || [];

  let bodyText = 'No songs to play';
  if (songs.length > 0) {
    const first = songs[0];
    bodyText = `${first.title} by ${first.artist} (${first.year})`;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="play-playlist-dialog-title"
    >
      <DialogTitle id="play-playlist-dialog-title">
        {playlist ? playlist.name : 'Play Playlist'}
      </DialogTitle>
      <DialogContent dividers>
        <Typography>{bodyText}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          CLOSE
        </Button>
      </DialogActions>
    </Dialog>
  );
}
