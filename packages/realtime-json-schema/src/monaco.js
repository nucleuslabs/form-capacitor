import * as monaco from '@timkendrick/monaco-editor';
import languageDef from './languageSyntaxDefinition';

export const JSONSCHEMA_DSL = 'jsonSchemaDSL';
monaco.languages.register({id: JSONSCHEMA_DSL});
monaco.languages.setMonarchTokensProvider(JSONSCHEMA_DSL, languageDef);

export default monaco;
