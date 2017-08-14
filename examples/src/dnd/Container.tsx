import React, { Component } from 'react';
import update from 'react/lib/update';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Draggable, {default as Item} from './Item';
import {compose} from 'recompose';
import {field} from 'form-capacitor';

const Container = ({value,onDrop}) => {
    return (
        <ul>
            {value.map((item,i) => <Item key={item.id} index={i} name={i} onDrop={onDrop}/>)}
        </ul>
    );
};

export default compose(
    DragDropContext(HTML5Backend),
    field({
        deserializeValue: x => x,
    })
)(Container);