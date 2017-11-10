import {compose, mapProps} from 'recompose';
import {omit} from 'lodash/fp';
export default compose(mapProps, omit);