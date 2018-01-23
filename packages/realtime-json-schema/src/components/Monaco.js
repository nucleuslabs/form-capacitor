import React from 'react';
import * as monaco from '@timkendrick/monaco-editor';
import styled from 'styled-components';
import '../optimizedResize';
import addEventListener from '../addEventListener';

const Container = styled.div`
    width: 100%;
    height: 100%;
`

export default class MonacoEditor extends React.Component {
    
    componentDidMount() {
        this.editor = monaco.editor.create(this.el, {
            minimap: {
                enabled: false
            }
        });
        this.unsubResize = window::addEventListener('optimizedResize', () => {
            this.editor.layout();
        })
    }
    
    componentWillUnmount() {
        this.unsubResize();
    }
    
    render() {
        return <Container innerRef={n=>this.el = n}/>
    }
}