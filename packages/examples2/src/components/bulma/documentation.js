import React from 'react';
import css from './documentation.scss';
import {withClass} from '../../lib/react';
import {Code} from './content';

export const Snippet = withClass('div',css['bd-snippet'], {
    isHorizontal: css['is-horizontal'],
});

export const SnippetPreview = withClass('div',css['bd-snippet-preview']);
export const SnippetCode = withClass('div',css['bd-snippet-code']);