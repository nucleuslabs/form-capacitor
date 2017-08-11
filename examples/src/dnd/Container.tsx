import React, { Component } from 'react';
import update from 'react/lib/update';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Draggable from './Item';
import {compose} from 'recompose';
import {field} from 'form-capacitor';

const Container = ({value}) => {
    return (
        <ul>
            {value.map((item,i) => (
                <li key={item.id}>{item.name}{item.children && item.children.length ? <Self name={`${i}.children`}/> : null}</li>
            ))}
        </ul>
    );
};


const Self = compose(
    DragDropContext(HTML5Backend),
    field({
        deserializeValue: x => x,
    })
)(Container);

export default Self;