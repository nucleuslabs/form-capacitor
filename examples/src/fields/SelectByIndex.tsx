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
        if(this.props.multiple) {
            if(this.props.selectedIndex) {
                let indexes = new Set(this.props.selectedIndex as number[]);
                Array.prototype.forEach.call(this.select.options, (opt, i) => {
                    opt.selected = indexes.has(i);
                });
            } else {
                Array.prototype.forEach.call(this.select.options, opt => {
                    opt.selected = false
                });
            }
        } else {
            this.select.selectedIndex = this.props.selectedIndex as number;
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