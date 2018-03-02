import {Fragment} from 'react';

export default function Icon({src}) {
    return <Fragment dangerouslySetInnerHTML={{__html:src}/>
}