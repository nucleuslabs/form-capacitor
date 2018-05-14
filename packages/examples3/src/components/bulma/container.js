import React from 'react';
import css from './bulma.scss';
import {classFactory, withClass} from '../../lib/react';
import cc from 'classcat';

// https://bulma.io/documentation/layout/container/

export const Container = withClass('div',css.container)