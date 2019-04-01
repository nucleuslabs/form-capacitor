const PropTypes = require('prop-types');
const _ = require('lodash');

function Svg(props) {
    let attrs = _.omit(props, ['sprite','title','desc']);
    return (
        <svg role="presentation" viewBox={props.sprite.viewBox} {...attrs}>
            <use xlinkHref={props.sprite.symbol}>
                {props.title ? <title>{props.title}</title> : null}
                {props.desc ? <desc>{props.desc}</desc> : null}
            </use>
        </svg>
    );
}

Svg.propTypes = {
    sprite: PropTypes.object.isRequired,
};


module.exports = Svg;