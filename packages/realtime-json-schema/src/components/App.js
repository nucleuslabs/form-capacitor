import styled, {css} from 'styled-components';
import MonacoEditor from './MonacoEditor';
import parser from '../grammar.pegjs';
import {Fragment} from 'react';
import ast2ajv from '../ast2ajv';
import pegJsGrammar from '!raw-loader!../grammar.pegjs';
import {JSONSCHEMA_DSL} from '../monaco';

const Grid = styled.div`
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-rows: repeat(3, 33%);
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: #323230;
    color: white;
    grid-gap: 2px;
    grid-template-areas:
        "pegjs-grammar dsl-schema"
        "ast-schema ajv-schema"
        "data result";
`


const FlexContainer = styled.div`
 display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    height: 100%;
    width: 100%;
`


const Panel = styled.div`
    grid-area: ${p => p.area};
    
    position: relative;
 
`

const JsonContainer = styled.div`
font-family: "SFMono-Regular",Consolas,"Liberation Mono",Menlo,Courier,monospace;
    white-space: pre-wrap;
    line-height: 18px;
    letter-spacing: 0;
    font-size: 12px;
    font-weight: normal;
    overflow-y: auto;
    flex: 1;
    
        ${p => p.error ? css`

        background-color:#231a1a;
          color: rgba(212,212,212,.5);
          cursor: not-allowed;
    ` : css`
          background-color: #232323;
            color: #d4d4d4;
    `}
`

const EditorContainer = styled.div`
    flex: 1;
    overflow: hidden;
`


const StatusBar = styled.div`
    //height: 35px;
    font-family: -apple-system,BlinkMacSystemFont,Segoe WPC,Segoe UI,HelveticaNeue-Light,Ubuntu,Droid Sans,sans-serif;
    font-size: 12px;
    //display: grid;
    //grid-template-columns: 1fr;
       padding: 2px 5px;
       color: white;
    ${p => p.error ? css`
        background-color: #cc0005;
    ` : css`
        background-color: #007ACC;
    `}
    
`

const ErrorMessage = styled.span`

`

const SuccessMessage = styled.span`

`

const BoxName = styled.span`
    display: inline-block;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    background-color: #353534;
    color: white;
    font-family: -apple-system,BlinkMacSystemFont,Segoe WPC,Segoe UI,HelveticaNeue-Light,Ubuntu,Droid Sans,sans-serif;
    font-size: 12px;
    padding: 0 5px 2px 5px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    user-select: none;
`

export default class App extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            astError: null,
            ajvError: null,
            ast: null,
            ajv: null,
            parseTime: 0
        }
        this.editorDefaultValue = localStorage.getItem('editorValue');
    }

    componentDidMount() {
        this.tryParse(this.editorDefaultValue);
    }

    render() {
        const {astError, ajvError, ast, parseTime, ajv} = this.state;

        return (
            <Grid>
                <Panel area="pegjs-grammar">
                    <FlexContainer>
                    <JsonContainer>{pegJsGrammar}</JsonContainer>
                    </FlexContainer>
                    <BoxName>PegJS</BoxName>
                </Panel>

                <Panel area="dsl-schema">
                    <FlexContainer>
                        <EditorContainer>
                            <MonacoEditor language={JSONSCHEMA_DSL} defaultValue={this.editorDefaultValue} onChange={this.onChange}/>
                        </EditorContainer>
                        <StatusBar error={!!astError}>
                            {astError ? (
                                <ErrorMessage>
                                    <strong>
                                        {!!astError.location && <Fragment>[Ln {astError.location.start.line},
                                            Col {astError.location.start.column}] </Fragment>}
                                        {astError.name}
                                        {': '}
                                    </strong>
                                    {astError.message}
                                </ErrorMessage>
                            ) : (
                                <SuccessMessage>
                                    Parsed in {parseTime.toPrecision(3)} ms
                                </SuccessMessage>
                            )}
                        </StatusBar>
                    </FlexContainer>
                    <BoxName>DSL</BoxName>
                </Panel>

                <Panel area="ast-schema">
                    <FlexContainer>
                        <JsonContainer error={!!astError}>{JSON.stringify(ast, null, 2)}</JsonContainer>
                    </FlexContainer>
                    <BoxName>AST</BoxName>
                </Panel>
                
                <Panel area="ajv-schema">
                    <FlexContainer>
                        <JsonContainer error={!!astError}>{JSON.stringify(ajv, null, 2)}</JsonContainer>
                        {!!ajvError && <StatusBar error>{String(ajvError)}</StatusBar>}
                    </FlexContainer>
                    <BoxName>AJV</BoxName>
                </Panel>
                <Panel area="data">
                    <FlexContainer>
                        <EditorContainer>
                            <MonacoEditor language="json"/>
                        </EditorContainer>
                    </FlexContainer>
                    <BoxName>Data</BoxName>
                </Panel>
                <Panel area="result">
                    <BoxName>Result</BoxName>
                </Panel>
            </Grid>
        )
    }

    // componentDidUpdate() {
    //     this.editor.layout();
    // }

    tryParse = value => {
        let ast;
        const start = performance.now();
        try {
            ast = parser.parse(value);
        } catch(astError) {
            this.setState({astError});
            return;
        }
        const parseTime = performance.now() - start;
        this.setState({astError: null, ast, parseTime});

        let ajv;
        try {
            ajv = ast2ajv(ast);
        } catch(ajvError) {
            this.setState({ajvError});
            return;
        }
        this.setState({ajvError: null, ajv});
    }

    onChange = ev => {
        localStorage.setItem('editorValue', ev.value);
        this.tryParse(ev.value);
    }
}
