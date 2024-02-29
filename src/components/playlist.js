import React, { useContext, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import 'bootstrap/dist/css/bootstrap.css';
import Info from './info';
import { MyContext } from '../myContext';
import { Button, Box, Typography} from '@mui/material';
import { FixedSizeList, areEqual } from 'react-window';



// repeat functions from search, may want to have them in their own file???
export default function Playlist(props) {
  const { columns, setColumns, dragged, deleteColumn} = useContext(MyContext);
  const [deleting, setDeleteing] = useState(false);
  function getStyle({ provided, style, isDragging }) {
    const combined = {
      ...style,
      ...provided.draggableProps.style,
    };
  
    const marginBottom = 8;
    const withSpacing = {
      ...combined,
      height: isDragging ? combined.height : combined.height - marginBottom,
      marginBottom,
    };
    return withSpacing;
  }
  function handleDeleteButton(){
    if(!deleting)
      setDeleteing(true)
    else 
      setDeleteing(true)
  }
  function Next({ provided, item, style, isDragging, playlist_id, index }) {
    return (
      <MyContext.Provider value={{ columns, setColumns, dragged}}>
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        style={getStyle({ provided, style, isDragging })}
      >
          <Info isDragging={isDragging} element={item} id={item.id} playlist_id={props.id} index={index}/>
      </div>
      </MyContext.Provider>
    );
  }
    const Row = React.memo(({ index, style, data, playlist_id }) => {
      const item = data[index];
      return (
        <Draggable draggableId={item.id} index={index} key={"same"}>
          {(provided) => <Next provided={provided} item={item} style={style} playlist_id={props.id} index={index} />}
        </Draggable>
      );
   }, areEqual);
    return(
        <div>
          {/* bootstrap TODO  */}
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            {/* TODO get rid of this button and figure out flexbox nonsense */}
            <Button disabled variant='text' onClick={() => deleteColumn(props.id)}></Button>  
            <Typography variant='h3' sx={{mt:1, textAlign:'right'}}>{props.data.playlist_name}</Typography>
            <Button  variant='text' disabled={deleting} onClick={() =>{
              handleDeleteButton()
              deleteColumn(props.id).then(()=>{
                setDeleteing(false)
              })
            }
              
            }
              >X</Button>  
          </Box>
        <Droppable droppableId={props.id} mode='virtual' renderClone={(provided, snapshot, rubric) => (
            <Next
              provided={provided}
              isDragging={snapshot.isDragging}
              item={props.data.items[rubric.source.index]}
              playlist_id={props.id}
            />
        )}>
        {(provided) => (
          // bootstrap TODO
          <Box sx={{my:2, py:2, borderTop:1, borderBottom:1 , borderRadius: '2%'}}>
          <FixedSizeList
            height={400}
            itemCount={props.data.items.length}
            itemSize={80}
            itemData={props.data.items}
            outerRef={provided.innerRef}
            innerElementType="ul"
            playlist_id = {props.id}
            style={{ maxHeight: '400px', overflow: 'auto' }}
            {...provided.droppableProps}
            >
            {Row}
          </FixedSizeList>
          </Box>
        )}
      </Droppable>
      </div>
    )
};