import { useContext, useEffect } from 'react';
import { GlobalStoreContext } from '../store';
import PlaylistCard from './PlaylistCard.js';
import MUIDeleteModal from './MUIDeleteModal';
import MUIPlayPlaylistModal from './MUIPlayPlaylistModal';

import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import Box from '@mui/material/Box';

/*
    This React component lists all the playlists in the UI.
*/
const HomeScreen = () => {
    const { store } = useContext(GlobalStoreContext);

    useEffect(() => {
        store.loadIdNamePairs();
    }, []);

    function handleCreateNewList() {
        store.createNewList();
    }

    let listCard = "";
    if (store) {
        listCard = (
            <>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {store.idNamePairs.map((pair) => (
                        <PlaylistCard
                            key={pair._id}
                            idNamePair={pair}
                            selected={false}
                        />
                    ))}
                </List>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Fab
                        color="primary"
                        aria-label="add"
                        id="add-list-button"
                        onClick={handleCreateNewList}
                    >
                        <AddIcon />
                    </Fab>
                </Box>
            </>
        );
    }

    return (
        <div id="playlist-selector">

            <div id="list-selector-heading">
                Your Playlists
            </div>

            <Box sx={{ bgcolor: "background.paper" }} id="list-selector-list">
                {listCard}
                <MUIDeleteModal />
                <MUIPlayPlaylistModal />
            </Box>

        </div>
    );
};

export default HomeScreen;
