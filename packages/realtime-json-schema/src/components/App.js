import styled from 'styled-components';
import MonacoEditor from './MonacoEditor';
import parser from '../grammar.pegjs';

const Grid = styled.div`
    display: grid;
    grid-template-columns: 50% 50%;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: #323230;
    grid-gap: 2px;
`

const ErrorBlock = styled.div`
    color: red;
`

const EditorContainer = styled.div`
 
`


const ResultContainer = styled.div`
    padding: 16px;
   background-color: #F6F8FA;
    overflow-y: auto;
      color: #24292e;
`

const AstContainer = styled.div`
    font-family: "SFMono-Regular",Consolas,"Liberation Mono",Menlo,Courier,monospace;
    white-space: pre-wrap;
    line-height: 18px;
    letter-spacing: 0;
    font-size: 12px;
    font-weight: normal;
    color: #24292e;

`

export default class App extends React.Component {
    
    state = {error: null, ast: null}
    
    render() {
        const {error,ast} = this.state;
        
        return (
            <Grid>
                <EditorContainer>
                    <MonacoEditor onChange={this.onChange}/>
                </EditorContainer>
                <ResultContainer>{error 
                    ? <ErrorBlock>
                        <p><strong>{error.name}:</strong> {error.message}</p>
                        {error.location ? <p>Line {error.location.start.line}, column {error.location.start.column}</p> : null}
                        </ErrorBlock> 
                    : <AstContainer>{JSON.stringify(ast,null,2)}</AstContainer>}</ResultContainer>
            </Grid>
        )
    }
    
    onChange = ev => {
        try {
            const ast = parser.parse(ev.value);
            this.setState({error:null,ast});
        } catch(error) {
            // console.log(error);
            this.setState({error});
        }
    }
}
