import React from 'react';
import {connectForm, form} from 'form-capacitor';
import {Button, Control, Field, Icon, SubmitButton, Title} from '../bulma';
import {compose,withHandlers} from 'recompose';
import withHigherHandlers from '../withHigherHandlers';
import {arraySplice} from '../util';
import Draggable from './Item';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Container from './Container';
import withDefault from '../../../src/hocs/withDefault';

interface Props {
    data: {
        instructions: object,
    }
}


const DragAndDropForm: React.SFC<Props> = ({data, onSubmit}) => {

    // console.log(data);
    
    return (
            <form onSubmit={onSubmit}>
                <Title>Drag ’n’ Drop</Title>
    
               
                <div className="content">
                    <Container name="things"/>
                </div>
               
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
    })
    withHandlers({
        onSubmit: ({data}) => ev => {
            ev.preventDefault();
            console.log('submit',data);
        }
    }),
    withHigherHandlers({

    })
)(DragAndDropForm);
