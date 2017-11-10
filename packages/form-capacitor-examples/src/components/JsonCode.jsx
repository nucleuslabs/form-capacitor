import SyntaxHighlighter, { registerLanguage } from "react-syntax-highlighter/dist/light"
import json from 'react-syntax-highlighter/dist/languages/json';
import style from 'react-syntax-highlighter/dist/styles/github-gist';
import {withProps} from 'recompose';
registerLanguage('json', json);

export default withProps({
    language: 'json',
    style: style,
})(SyntaxHighlighter);

