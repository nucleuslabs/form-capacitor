import React from 'react';

export default class SelectByIndex extends React.PureComponent {

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
            this.select.selectedIndex = -1; // clear existing selections
            if(this.props.selectedIndex) {
                let indexes = new Set(this.props.selectedIndex);
                
                for(let idx of this.props.selectedIndex) {
                    this.select.options[idx].selected = true;
                }
            }
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