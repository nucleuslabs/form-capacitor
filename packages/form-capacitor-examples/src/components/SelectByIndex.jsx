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
            if(this.props.selectedIndex && this.props.selectedIndex.length) {
                this.select.selectedIndex = this.props.selectedIndex[0];
                
                for(let i=this.props.selectedIndex.length; i>0; --i) {
                    this.select[idx].selected = true;
                }
            } else {
                this.select.selectedIndex = -1;
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