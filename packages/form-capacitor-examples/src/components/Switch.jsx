import React from 'react';
import css from './Switch.less';
import cc from 'classcat';

export default function Switch({id,checked,onChange,on,off}) {
    return (
        <label id={id} className={cc([css.switch,{[css.checked]: checked}])}>
            <input className={css.checkbox} type="checkbox" checked={checked} onChange={onChange}/>
            <span className={css.slider}>
                {on || off ? <span className={css.text}>{checked ? on : off}</span> : null}
            </span>
        </label>
    )

}
