

function Select(props) {
    return <select {...props}/>;
}

export default withSchema({
    type: "any" // value can be a number, a string, or even an object!
});