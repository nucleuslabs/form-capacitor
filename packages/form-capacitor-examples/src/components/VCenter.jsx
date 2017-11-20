import css from './VCenter.less';

export default function VCenter({children}) {
    return <div className={css.root} children={children}/>
}