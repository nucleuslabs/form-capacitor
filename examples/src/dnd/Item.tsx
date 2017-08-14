import React from 'react';
import PropTypes from 'prop-types';
import {DragSource,DropTarget} from 'react-dnd';
import {compose} from 'recompose';
import {field} from 'form-capacitor';
import Container from './Container';
import ItemTypes from './ItemTypes';
import { findDOMNode } from 'react-dom';




const Item = ({value, isDragging, connectDragSource, connectDropTarget, onDrop}) => {
    const opacity = isDragging ? .25 : 1;
    
    return connectDragSource(connectDropTarget(
        <li style={{opacity}}>{value.name}{value.children && value.children.length ? <Container name="children" onDrop={onDrop} /> : null}</li>
    ));
};

const dragSource = {
    beginDrag: props => ({
        id: props.value.id,
        index: props.index,
        path: props.path,
    }),
};

const dragTarget = {
    // hover(props, monitor, component) {
    //     const dragIndex = monitor.getItem().index;
    //     const hoverIndex = props.index;
    //    
    //     console.log(props.path, monitor.getItem().path);
    //
    //     // Don't replace items with themselves
    //     if (dragIndex === hoverIndex) {
    //         return;
    //     }
    //
    //     // Determine rectangle on screen
    //     const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
    //
    //     // Get vertical middle
    //     const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    //
    //     // Determine mouse position
    //     const clientOffset = monitor.getClientOffset();
    //
    //     // Get pixels to the top
    //     const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    //
    //     // Only perform the move when the mouse has crossed half of the items height
    //     // When dragging downwards, only move when the cursor is below 50%
    //     // When dragging upwards, only move when the cursor is above 50%
    //
    //     // Dragging downwards
    //     if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
    //         return;
    //     }
    //
    //     // Dragging upwards
    //     if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
    //         return;
    //     }
    //    
    //     console.log(dragIndex, hoverIndex);
    // },
    
    drop(props, monitor, component) {
        if(monitor.didDrop()) {
            return;
        }
        
        props.onDrop(monitor.getItem().path, props.path);
        // console.log(monitor.getItem().path.join('.'),' DROPPED ON ',props.path.join('.'));
    },
};


export default compose(
    field({
        deserializeValue: x => x,
    }),
    DropTarget(ItemTypes.ITEM, dragTarget, (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        isOverCurrent: monitor.isOver({ shallow: true }),
    })),
    DragSource(ItemTypes.ITEM, dragSource, (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    }))
)(Item) as any;

//
// export default DragSource('DRAGGABLE', dragSource, (connect, monitor) => ({
//     connectDragSource: connect.dragSource(),
//     isDragging: monitor.isDragging(),
// }))(Item);