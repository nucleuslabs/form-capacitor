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
monaco.languages.setMonarchTokensProvider(languageId, languageDef);

// https://microsoft.github.io/monaco-editor/monarch.html

export default class MonacoEditor extends React.Component {

    componentDidMount() {
        const value = localStorage.getItem('editorValue');
        this.editor = monaco.editor.create(this.el, {
            value,
            minimap: {
                enabled: false
            },
            language: languageId,
            folding: false
        });
        if(this.props.onChange) {
            // FIXME: we shouldn't call the onChange event immediately but...screw it.
            this.props.onChange.call(this.editor, {value});
        }
        this.editor.onDidChangeModelContent(ev => {
            const value = this.editor.getValue();
            localStorage.setItem('editorValue', value);
            if(this.props.onChange) {
                this.props.onChange.call(this.editor, {...ev, value});
            }
        });
        this.unsubResize = window::addEventListener('optimizedResize', () => {
            this.editor.layout();
        })
    }

    componentWillUnmount() {
        this.unsubResize();
        this.editor.dispose();
    }

    render() {
        return <Container innerRef={n => this.el = n}/>
    }
}