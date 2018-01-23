import styled from 'styled-components';
import MonacoEditor from './MonacoEditor';

const Grid = styled.div`
    display: grid;
    grid-template-columns: 50% 50%;
    background-color: yellow;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
`

export default function App() {
    return (
        <Grid>
            <div>
                <MonacoEditor/>
            </div>
            <div>b</div>
        </Grid>
    )
}