import elem from '../factory';
import css from '../bulma.scss';

export const Table = elem('table',css.table, {
    isBordered: css['is-bordered'],
    isStriped: css['is-striped'],
    isNarrow: css['is-narrow'],
    isHoverable: css['is-hoverable'],
    isFullwidth: css['is-fullwidth'],
})

export const TableHead = elem('thead');
export const TableBody = elem('tbody');
export const TableFoot = elem('tfoot');
export const TableRow = elem('tr',null,{
    isSelected: css['is-selected'],
});
export const TableHeadCell = elem('th');
export const TableCell = elem('td');