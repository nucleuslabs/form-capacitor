import React from 'react';
import * as monaco from '@timkendrick/monaco-editor';
import styled from 'styled-components';
import '../optimizedResize';
import addEventListener from '../addEventListener';
import languageDef from '../languageSyntaxDefinition';

const Container = styled.div`
    width: 100%;
    height: 100%;
`

const languageId = 'jsonSchemaDSL';
monaco.languages.register({id: languageId});
monaco.languages.setMonarchTokensProvider(languageId,languageDef);

// https://microsoft.github.io/monaco-editor/monarch.html

export default class MonacoEditor extends React.Component {
    
    componentDidMount() {
        this.editor = monaco.editor.create(this.el, {
            value: localStorage.getItem('editorValue'),
            minimap: {
                enabled: false
            },
            language: languageId,
            folding: false
        });
        this.editor.onDidChangeModelContent(ev => {
           localStorage.setItem('editorValue',this.editor.getValue());
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