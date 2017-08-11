import React from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
// import ItemTypes from './ItemTypes';





const Item = ({name, isDragging, connectDragSource}) => connectDragSource(
    <div>{name}</div>
);

const dragSource = {
    beginDrag: p => ({
        name: p.name,
    }),
};

export default DragSource('DRAGGABLE', dragSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
}))(Item);