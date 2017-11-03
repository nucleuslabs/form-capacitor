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
            if(this.props.selectedIndex && this.props.selectedIndex.length) {
                const [first, ...rest] = this.props.selectedIndex;
                this.select.selectedIndex = first;

                for(let idx of rest) {
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