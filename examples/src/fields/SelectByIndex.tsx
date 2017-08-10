import React, {SelectHTMLAttributes} from 'react';

export default class SelectByIndex extends React.PureComponent<SelectHTMLAttributes<HTMLSelectElement> & {selectedIndex: number|number[]}> {
    private select: HTMLSelectElement;
    
    componentDidMount() {
        this.refresh();
    }
    
    componentDidUpdate(prevProps) {
        if(prevProps.selectedIndex !== this.props.selectedIndex) {
            this.refresh();
        }
    }
    
    refresh() {
        if(Array.isArray(this.props.selectedIndex)) {
            let indexes = new Set(this.props.selectedIndex);
            Array.prototype.forEach.call(this.select.options, (opt,i) => {
                opt.selected = indexes.has(i);
            });
        } else {
            this.select.selectedIndex = this.props.selectedIndex;
        }
    }
    
    setRef = n => {
        this.select = n;
    };
    
    render() {
        const {selectedIndex, ...props} = this.props;
        return <select {...props} ref={this.setRef}/>;
    }
}