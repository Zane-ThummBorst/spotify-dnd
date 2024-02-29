import React, { useState, useEffect } from 'react';
import { DragDropContext} from 'react-beautiful-dnd';
import './App.css'
import 'bootstrap/dist/css/bootstrap.css';
import PlayListColumns from './components/PlaylistColumns'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { MyContext } from "./myContext";
import {Button, Container, Box, Pagination, TextField} from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2';
import Auth from './components/auth';
import SearchColumn from './components/SearchColumn'
const clientId = 'afb7072142534f63a2142805b5417358';

const getRefreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  const url = "https://accounts.spotify.com/api/token";
  const payload = {
     method: 'POST',
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded'
     },
     body: new URLSearchParams({
       grant_type: 'refresh_token',
       refresh_token: refreshToken,
       client_id: clientId
     }),
   }
   const body = await fetch(url, payload);
   const response = await body.json();
   localStorage.setItem('access_token', response.access_token);
   localStorage.setItem('refresh_token', response.refresh_token);
   let curDate = new Date()
   localStorage.setItem('expire_time', curDate.setSeconds(curDate.getSeconds() + response.expires_in))

 }

const is_expired = () =>{
  let curDate = new Date()
  curDate = curDate.getTime().toString()
  let expireDate = localStorage.getItem('expire_time')
  if(curDate >= expireDate){
    getRefreshToken()
    return 'access token Updated'
  }else{
    return 'token has not expired'
  }
}

// THeres gotta be an easier way to do this
const onDragEnd = (result, columns, setColumns, users, setUsers, setDragged) => {
  if (!result.destination) return;
  const { source, destination } = result;

  if(source.droppableId == "Search"){
      const sourceColumn =[...users];
      const destColumn = columns[destination.droppableId];
      const destItems = [...destColumn.items];
      destItems.splice(destination.index, 0, sourceColumn[source.index]);
      let item = sourceColumn.splice(source.index, 1)[0];
      const newitem = {...item, id: uuidv4()}
      sourceColumn.splice(source.index, 0, newitem )
      setColumns({
        ...columns,
        [destination.droppableId]: {
          ...destColumn,
           items: destItems
        }
      });
      setUsers(sourceColumn);
  }
  else if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
         items: sourceItems
      },
      [destination.droppableId]: {
        ...destColumn,
         items: destItems
      }
    });
  } else {
    const column = columns[source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
         items: copiedItems
      }
    });
    setDragged('w-100');
  }
};



function App() {
  // rename this to something more appropriate
  const [columns, setColumns] = useState({});
  //rename this to something more appropriate
  let [users, setUsers] = useState([]);
  let [playlistName, setPlaylistName] = useState('');
  const [dragged, setDragged] = useState('w-100');
  const [code, setCode] = useState(null);
  const [userId, setUserId] = useState(null);
  const [page, setPage] = useState(1);
  const [searchPlaylist, setSearchPlaylist] = useState('')
  const [totalPlaylists, setTotalPlaylists] = useState(0)
  const [sync, setSync] = useState(false)

  const handlePage = (event, value) =>{
    console.log(columns)
    setColumns({})
    setPage(value)
  }

  useEffect(()=>{
    getPlaylist((page-1)*4, searchPlaylist)
  }, [page])

  useEffect(() =>{
    const args = new URLSearchParams(window.location.search);
    const url_code = args.get('code');
    setCode(url_code)
  }, [])
  

  const getTotal = async()=>{
    console.log('yes')
    await axios.post("http://localhost:1234/neet/back/totalPlaylists",{
      username: localStorage.getItem('user_id'),
      term: searchPlaylist,
    }).then(response =>{
      console.log(response.data)
      setTotalPlaylists(response.data)
    }).catch(error =>{
      console.log(localStorage.getItem('user_id'))
    })
  }
 useEffect(() =>{
  getTotal()
 }, [])

useEffect(() =>{
  const syncDisabled = localStorage.getItem('syncDisabled')
  if(syncDisabled){
    const time = new Date().getTime();
    if(time < syncDisabled){
      setSync(true)
      setTimeout(() => {
        setSync(false);
        localStorage.removeItem('syncDisabled');
      }, syncDisabled - time);
    }
  }
},[])

  const handleAddColumn = async(event) =>{
    event.preventDefault()
    let len = uuidv4();
    let id
    await publishPlaylist({playlist_id: null, playlist_name: playlistName, items: []},len)
    .then((response) =>{
      id = response
      let total = totalPlaylists
      setTotalPlaylists(total+1)
    })
    let newColumn = {[len]: {playlist_id: id, playlist_name: playlistName, items: []}, ...columns}
    let last_key = Object.keys(newColumn).pop()
    let count= Object.keys(newColumn).length;
    if(count > 4){
      delete newColumn[last_key]
    }
    setColumns(newColumn)
  }


  const deleteFromSpot = async(id, col) =>{
    try {
      const response = await axios.post("http://localhost:1234/neet/back/delete", {
        access_token: localStorage.getItem('access_token'),
        playlist_id: col[id]['playlist_id'],
        page: page,
        username: localStorage.getItem('user_id')
      });
      return response;
   } catch (error) {
      throw error;
   }
  }


  const getOne = async(newColumn) =>{
    let result
    await axios.post("http://localhost:1234/neet/back/getOne",{
      access_token: localStorage.getItem('access_token'),
      index: ((page-1)*4) + 4,
      username: localStorage.getItem('user_id'),
      term: searchPlaylist
    })
    .then((response)=>{
      console.log(response)
      if(!response.data){
        return undefined
      }else{
      let len = uuidv4();
      let playlist_id = response.data.playlist_id
      let playlist_name = response.data.playlist_name
      let items = response.data.items
      result = {
        len: len,
        playlist_id: playlist_id,
        playlist_name: playlist_name,
        items: items
      }
    }
    }).catch(error =>{
      console.log(error)
    })
    return result;
  }
  const deleteColumn = async(id) => {
    let newColumn = {...columns};
    try{
      const response = await getOne(newColumn);
      await deleteFromSpot(id, newColumn);
      delete newColumn[id];
      let total = totalPlaylists
      setTotalPlaylists(total -1)
      setColumns(newColumn)
      console.log(response)
      if(!response){
        setColumns(newColumn)
      }else{
        setColumns({...newColumn, [response.len]: {playlist_id: response.playlist_id, playlist_name: response.playlist_name, items: response.items}});
      }
    }catch{
      console.log('balsac')
    }
  }

  const publishPlaylist = async(playlist_name, id) =>{
    const play = playlist_name
    let result;
    console.log(is_expired())
    console.log('balls')
    await axios.post("http://localhost:1234/neet/back/createPlaylist",{
      user_id: localStorage.getItem('user_id'),
      access_token: localStorage.getItem('access_token'),
      playlist: play.playlist_name
    }).then((response) =>{
      result = response.data
      //console.log(result)
    }).catch((error) =>{
      console.log(error)
    })
    //.log(result)
    return result
  }

  const updatePlaylist = (id) =>{
    console.log(is_expired())
    let newColumn = {...columns};
    console.log(newColumn[id])
    axios.post("http://localhost:1234/neet/back/updatePlaylist",{
      user_id: localStorage.getItem('user_id'),
      access_token: localStorage.getItem('access_token'),
      items: newColumn[id]['items'],
      playlist_id: newColumn[id]['playlist_id']
    }).catch((error) =>{
      console.log(error)
    })
  }

    const getPlaylist = (offset, term = '') =>{
      console.log(is_expired())
      let temp = {}
      // let newColumn = {...columns}
      let newColumn = {}
      axios.post("http://localhost:1234/neet/back/userPlaylist",{
        user_id: localStorage.getItem('user_id'),
        access_token: localStorage.getItem('access_token'),
        offset: offset,
        page: page,
        term: term,
        username: localStorage.getItem('user_id')
      }).then((response) =>{
        response.data.map( (element) =>{
          let len = uuidv4()
          newColumn[ len ] = element
          //setColumns({...columns, [len]: element})
        })
        setColumns(newColumn)
      }).catch((error) =>{
        console.log(error)
      })
  }


  const handleSync = async() =>{
    await  axios.post("http://localhost:1234/neet/back/userInfo",{
      access_token: localStorage.getItem('access_token'),
      sync: true
    })
    setSync(true);
    const oneHour = new Date().getTime() +  3600000;
    localStorage.setItem('syncDisbaled', oneHour);
  }

    return(
      <Container maxWidth='xl'>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <MyContext.Provider value={{code, setCode, userId, setUserId}}>
            <Auth></Auth>
            <Pagination sx={{mt:2}} count={Math.ceil(totalPlaylists/4)} onChange={handlePage}/>
           
              <TextField
                id='set_playlist_name'
                sx={{width: 300, mt: 2}}
                label='Search For Playist'
                onChange={(event) =>{setSearchPlaylist(event.target.value)}}
                InputProps={{endAdornment: <Button sx={{mx: 1}} onClick={()=>{getPlaylist((page-1)*4, searchPlaylist)
                                                                                getTotal()}} variant='outlined' type='submit'>Submit</Button> }}
              />
            <Button sx={{mt: 2}} disabled={sync} variant='outlined' onClick={() =>{
              handleSync()
            } }>sync</Button>
          </MyContext.Provider>
        </Box>
        <DragDropContext
        onDragStart={() =>{setDragged('')}}
        onDragEnd={(result) => onDragEnd(result, columns, setColumns, users, setUsers, setDragged)}>
        <Grid sx={{mt: 2}} container spacing={6}>
          <MyContext.Provider value={{setPlaylistName, users, setUsers, is_expired, getRefreshToken, handleAddColumn }}>
            <SearchColumn ></SearchColumn>
          </MyContext.Provider>

          <MyContext.Provider value={{columns, setColumns, dragged, deleteColumn, updatePlaylist, publishPlaylist }}>
            <PlayListColumns even={0}></PlayListColumns>
            <PlayListColumns even={1}></PlayListColumns>
          </MyContext.Provider>
          
        </Grid>
            {/* <Pagination sx={{mt:2, display:'flex', flexDirection:'row-reverse'}} count={10} onChange={handlePage}/> */}
        </DragDropContext>
      </Container>
    )
  }
  
export default App;

