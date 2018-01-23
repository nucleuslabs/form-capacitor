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
    background-color: black;
    grid-gap: 2px;
`

const ErrorBlock = styled.div`
    color: red;
`

const EditorContainer = styled.div`
 
`


const ResultContainer = styled.div`
    padding: 10px;
    background-color: white;
`

export default class App extends React.Component {
    
    state = {error: null}
    
    render() {
        const {error} = this.state;
        
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
                    : null}</ResultContainer>
            </Grid>
        )
    }
    
    onChange = ev => {
        try {
            const ast = parser.parse(ev.value);
            this.setState({error:null});
        } catch(error) {
            console.log(error);
            this.setState({error});
        }
    }
}
