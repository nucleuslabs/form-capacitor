import React from 'react';
import css from './bulma.scss';
import elem from './factory';

// https://bulma.io/documentation/elements/title/

export const Title1 = elem('h1',[css.title,css['is-1']]);
export const Title2 = elem('h2',[css.title,css['is-2']]);
export const Title3 = elem('h3',[css.title,css['is-3']]);
export const Title4 = elem('h4',[css.title,css['is-4']]);
export const Title5 = elem('h5',[css.title,css['is-5']]);
export const Title6 = elem('h6',[css.title,css['is-6']]);
export const Title = Title3;

export const Subtitle1 = elem('h1',[css.subtitle,css['is-1']]);
export const Subtitle2 = elem('h2',[css.subtitle,css['is-2']]);
export const Subtitle3 = elem('h3',[css.subtitle,css['is-3']]);
export const Subtitle4 = elem('h4',[css.subtitle,css['is-4']]);
export const Subtitle5 = elem('h5',[css.subtitle,css['is-5']]);
export const Subtitle6 = elem('h6',[css.subtitle,css['is-6']]);
export const Subtitle = Subtitle5;