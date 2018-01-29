import styled, {css} from 'styled-components';
import MonacoEditor from './MonacoEditor';
import parser from '../grammar.pegjs';
import {Fragment} from 'react';
import ast2ajv from '../ast2ajv';

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


const PegJsGrammar = styled.div`
    grid-area: pegjs-grammar;
`
const DslSchema = styled.div`
    grid-area: dsl-schema;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    //position: absolute;
    //width: 100%;
    //height: 100%;
`

const FlexContainer = styled.div`
 display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    height: 100%;
    width: 100%;
`

const AjvSchema = styled.div`
    grid-area: ajv-schema;
      position: relative;
     
`

const DataContainer = styled.div`
    grid-area: data;
`

const Result = styled.div`
    grid-area: result;
`

const ResultContainer = styled.div`
    padding: 10px;
`

const AstSchema = styled.div`
    grid-area: ast-schema;
    
    position: relative;
 
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

        background-color:#F1E0E0;
          color: rgba(36,41,46,.5);
          cursor: not-allowed;
    ` : css`
          background-color: #F6F8FA;
            color: #24292e;
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
                    <BoxName>PegJS</BoxName>
                </Panel>

                <Panel area="dsl-schema">
                    <FlexContainer>
                        <EditorContainer>
                            <MonacoEditor ref={e => this.editor = e} defaultValue={this.editorDefaultValue} onChange={this.onChange}/>
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
