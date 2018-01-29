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
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    
        ${p => p.error ? css`

        background-color:#F1E0E0;
          color: #2e2529;
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
            error: null, 
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
        const {error,ast,parseTime,ajv} = this.state;
        
        return (
            <Grid>
                <Panel area="pegjs-grammar">
                    <BoxName>PegJS</BoxName>
                </Panel>
                
                <DslSchema>
                    <EditorContainer>
                        <MonacoEditor ref={e => this.editor=e} defaultValue={this.editorDefaultValue} onChange={this.onChange}/>
                    </EditorContainer>
                    <StatusBar error={!!error}>
                        {error ? (
                            <ErrorMessage>
                                <strong>
                                    {!!error.location && <Fragment>[Ln {error.location.start.line}, Col {error.location.start.column}] </Fragment>}
                                    {error.name}
                                    {': '}
                                </strong>
                                {error.message}
                            </ErrorMessage>
                        ):(
                            <SuccessMessage>
                                Parsed in {parseTime.toPrecision(3)} ms
                            </SuccessMessage>
                        )}
                    </StatusBar> 
                </DslSchema>
                
                <Panel area="ast-schema">
                    <JsonContainer error={!!error}>{JSON.stringify(ast,null,2)}</JsonContainer>
                    <BoxName>AST</BoxName>
                </Panel>
                
                <Panel area="ajv-schema">
                    <JsonContainer>{JSON.stringify(ajv,null,2)}</JsonContainer>
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
        try {
            const start = performance.now();
            const ast = parser.parse(value);
            const parseTime = performance.now() - start;
            let ajv = ast2ajv(ast);
            this.setState({error:null,ast,parseTime,ajv});
        } catch(error) {
            // console.log(error);
            this.setState({error});
        }
    }
    
    onChange = ev => {
        localStorage.setItem('editorValue', ev.value);
        this.tryParse(ev.value);
    }
}
