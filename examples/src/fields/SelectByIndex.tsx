import React, {SelectHTMLAttributes} from 'react';

// not sure how to make this work for multi-selects...

export default class SelectByIndex extends React.PureComponent<SelectHTMLAttributes<HTMLSelectElement> & {selectedIndex: number}> {
    
    private el: HTMLSelectElement;
    
    componentDidMount() {
        this.el.selectedIndex = this.props.selectedIndex;
    }
    
    componentDidUpdate(prevProps) {
        if(prevProps.selectedIndex !== this.props.selectedIndex) {
            this.el.selectedIndex = this.props.selectedIndex;    
        }
    }
    
    ref = n => {
        this.el = n;
    };
    
    render() {
        const {selectedIndex, ...props} = this.props;
        return <select {...props} ref={this.ref}/>;
    }
}