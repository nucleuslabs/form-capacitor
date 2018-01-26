import styled, {css} from 'styled-components';
import MonacoEditor from './MonacoEditor';
import parser from '../grammar.pegjs';
import {Fragment} from 'react';

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
`

const AjvSchema = styled.div`
    grid-area: ajv-schema;
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
    font-family: "SFMono-Regular",Consolas,"Liberation Mono",Menlo,Courier,monospace;
    white-space: pre-wrap;
    line-height: 18px;
    letter-spacing: 0;
    font-size: 12px;
    font-weight: normal;
    overflow-y: auto;
  
  
    ${p => p.error ? css`
        background-color:#F1E0E0;
          color: #2e2529;
          cursor: not-allowed;
    ` : css`
          background-color: #F6F8FA;
            color: #24292e;
    `}
`

const BuildMessage = styled.div`
    flex: 0;
    font-family: sans-serif;
    font-size: 12px;
`

const ErrorMessage = styled.div`
    background-color: orange;
    padding: 2px 5px;
`

const SuccessMessage = styled.div`
    background-color: #c0ffc0;
    padding: 2px 5px;
`


const EditorContainer = styled.div`
    flex: 1;
`

export default class App extends React.Component {
    
    state = {error: null, ast: null, parseTime: 0}
    
    render() {
        const {error,ast,parseTime} = this.state;
        
        return (
            <Grid>
                <PegJsGrammar>
                    PegJS
                </PegJsGrammar>
                
                <DslSchema>
                    <EditorContainer>
                        <MonacoEditor onChange={this.onChange}/>
                    </EditorContainer>
                    <BuildMessage>
                        
                        {error ? <ErrorMessage>
                        <strong>{error.name}:</strong> {error.message}
                            {error.location ? <Fragment><br/>Line {error.location.start.line}, column {error.location.start.column}</Fragment> : null}</ErrorMessage>
                        : <SuccessMessage>
                                Parsed in {parseTime.toPrecision(3)} ms
                            </SuccessMessage>}
                    </BuildMessage> 
                </DslSchema>
                
                <AstSchema error={!!error}>
                    {JSON.stringify(ast,null,2)}
                </AstSchema>
                
                <AjvSchema>AJV</AjvSchema>
                <DataContainer>Data</DataContainer>
                <Result>Valid</Result>
            </Grid>
        )
    }
    
    onChange = ev => {
        try {
            const start = performance.now();
            const ast = parser.parse(ev.value);
            const parseTime = performance.now() - start;
            this.setState({error:null,ast,parseTime});
        } catch(error) {
            // console.log(error);
            this.setState({error});
        }
    }
}
