const _ = require('lodash');

module.exports = function Svg(props) {
    let attrs = _.omit(props, ['glyph','title','desc']);
    return (
        <svg role="presentation" viewBox={props.glyph.viewBox} {...attrs}>
            <use xlinkHref={props.glyph.symbol}>
                {props.title ? <title>{props.title}</title> : null}
                {props.desc ? <desc>{props.desc}</desc> : null}
            </use>
        </svg>
    );
}