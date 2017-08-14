import React from 'react';
import {connectForm, form} from 'form-capacitor';
import {Button, Control, Field, Icon, SubmitButton, Title} from '../bulma';
import {compose,withHandlers,withProps} from 'recompose';
import withHigherHandlers from '../withHigherHandlers';
import {arraySplice} from '../util';
import Draggable from './Item';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Container from './Container';
import withDefault from '../../../src/hocs/withDefault';
import Lo from 'lodash';
import update from 'immutability-helper2';

interface Props {
    data: {
        instructions: object,
    }
}


const DragAndDropForm: React.SFC<Props> = ({data, onSubmit, onDrop}) => {

    // console.log(data);
    
    return (
            <form onSubmit={onSubmit}>
                <Title>Drag ’n’ Drop</Title>
    
               
                <div className="content">
                    <Container name="things" onDrop={onDrop}/>
                </div>

                <SubmitButton>Submit</SubmitButton>
            </form>
    )
};

export default compose(
    form({
        name: 'dragAndDrop',
    }),
    withDefault({
        things: [
            {
                id: 1,
                name: "Animals",
                children: [
                    {
                        id: 2,
                        name: "Mammals",
                        children: [
                            {
                                id: 3,
                                name: "Monkey",
                            },
                            {
                                id: 4,
                                name: "Pig"
                            },
                            {
                                id: 5,
                                name: "Dogs",
                                children: [
                                    {
                                        id: 6,
                                        name: "Spaniel",
                                        children: [
                                            {
                                                id: 7,
                                                name: "Field"
                                            },
                                            {
                                                id: 8,
                                                name: "Springer"
                                            },
                                            {
                                                id: 9,
                                                name: "Cocker"
                                            },
                                        ]
                                    },
                                    {
                                        id: 10,
                                        name: "Poodle"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 11,
                        name: "Reptiles",
                        children: [
                            {
                                id: 12,
                                name: "Turtle"
                            },
                            {
                                id: 13,
                                name: "Snake",
                            }
                        ]
                    },
                    {
                        id: 14,
                        name: "Insects",
                        children: [
                            {
                                id: 15,
                                name: "Bee"
                            },
                            {
                                id: 16,
                                name: "Ant"
                            }
                        ]
                    }
                ]
            }
        ]
    }),
    withProps(props => ({
        onDrop(a,b) {
            let p1 = getRelativePath(props.path, a);
            let p2 = getRelativePath(props.path, b);
            
            let el = Lo.get(props.data, p1);
            let idx1 = parseInt(p1.pop());
            let idx2 = parseInt(p2.pop());
            
            // console.log(el, p1, idx1, p2, idx2);

            let updates = {};
            let o = updates;
            for(let p of p1) {
                o[p] = {};
                o = o[p];
            }
            o.$splice = [[idx1, 1]];

            o = updates;
            for(let p of p2) {
                o[p] = o[p] || {};
                o = o[p];
            }
            
            if(!o.$splice) {
                o.$splice = [];
            }
            o.$splice.push([idx2,0,el]);
            
            props.dispatch(null, s => update(s,updates));
            
            // props.dispatch(p1, children => arraySplice(children, idx1));
            // props.dispatch(p2, children => arraySplice(children, idx2, 0, el));
        }
    })),
    withHandlers({
        onSubmit: ({data}) => ev => {
            ev.preventDefault();
            console.log('submit',data);
        }
    }),
    withHigherHandlers({

    })
)(DragAndDropForm) as any;

function getRelativePath(a,b) {
    let i=0;
    while(a[i]===b[i]) {
        ++i;
    }
    return b.slice(i);
}