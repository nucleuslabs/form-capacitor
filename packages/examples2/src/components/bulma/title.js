import React from 'react';
import css from './bulma.scss';
import {withClass} from '../../lib/react';

// https://bulma.io/documentation/elements/title/

export const Title1 = withClass('h1',[css.title,css['is-1']]);
export const Title2 = withClass('h2',[css.title,css['is-2']]);
export const Title3 = withClass('h3',[css.title,css['is-3']]);
export const Title4 = withClass('h4',[css.title,css['is-4']]);
export const Title5 = withClass('h5',[css.title,css['is-5']]);
export const Title6 = withClass('h6',[css.title,css['is-6']]);
export const Title = Title3;

export const Subtitle1 = withClass('h1',[css.subtitle,css['is-1']]);
export const Subtitle2 = withClass('h2',[css.subtitle,css['is-2']]);
export const Subtitle3 = withClass('h3',[css.subtitle,css['is-3']]);
export const Subtitle4 = withClass('h4',[css.subtitle,css['is-4']]);
export const Subtitle5 = withClass('h5',[css.subtitle,css['is-5']]);
export const Subtitle6 = withClass('h6',[css.subtitle,css['is-6']]);
export const Subtitle = Subtitle5;