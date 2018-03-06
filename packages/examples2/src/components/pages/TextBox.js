




@mount(p => p.name)
@connect({
    propName: 'value',
    initialValue: '',
})
export class TextBox extends React.Component {
    
    
    change = ev => {
        this.props.value.set(ev.currentTarget.value);
    }
    
    
    render() {
        
        return (
                <input type="text" onChange={this.change} value={this.props.value}/>
        )
    }
}