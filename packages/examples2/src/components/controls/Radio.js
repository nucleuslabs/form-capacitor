import {Radio as Component} from '../bulma';
import {mount,connect} from '../../form-capacitor';
import {action} from 'mobx';
import React from 'react';
import shortid from 'shortid';
import PropTypes from 'prop-types';


const radioNameProp = shortid();

const radioContextTypes = {
    [radioNameProp]: PropTypes.string,
    _fcMount: PropTypes.any,
};


export class _RadioMenu extends React.Component {
    static childContextTypes = radioContextTypes;
    
    getChildContext() {
        // console.log('xxx');
        return {
            [radioNameProp]: shortid(),
        }
    }

    render() {
        // console.log('rendder',this.getChildContext);
        return this.props.children;
    }
}

export const RadioMenu = mount({
    defaultValue: p => p.defaultValue !== undefined ? p.defaultValue : null,
    path: p => p.name,
})(_RadioMenu);


@connect({
    propName: 'menuValue',
})
export class Radio extends React.Component {
    static contextTypes = radioContextTypes;
    
    @action.bound
    handleChange(ev) {
        this.menuValue = ev.target.value;
        if(this.props.onChange) {
            this.props.onChange(ev)
        }
    }

    render() {
        const {value, ...props} = this.props;
        // console.log('this.context',this.context,radioNameProp);
        return <Component {...props} checked={this.menuValue==value} onChange={this.handleChange} name={this.context[radioNameProp]} value={value}/>
    }
}