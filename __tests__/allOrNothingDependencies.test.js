import React, {useState} from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import useSchema from "../src/useSchema";
import useConsume from "../src/useConsume";
import useConsumeErrors from "../src/useConsumeErrors";
import useConsumeArray from "../src/useConsumeArray";
import {useObserver} from "mobx-react-lite";
import SubSchema from "../src/SubSchema";
import {toJS} from "mobx";
import {getFlattenedErrors} from "../src/errorMapping";



function TextBoxArray({dataTestId,name}) {
    const [value, set, {push, remove, slice, splice, clear, replace}] = useConsumeArray(name);
    const [hasErrors] = useConsumeErrors(name);

    const handleChange = idx => ev => {
        splice(idx, 1, ev.target.value);
    };
    return <div>
        <div data-testid={`${dataTestId}_errors`} className={hasErrors ? "error" : null}>
            {value.map((inst, key) => <div key={key}><input type="text" data-testid={dataTestId} className={hasErrors ? "error" : null} name={`${name}.${key}`} value={inst || ""}
                                                  onChange={handleChange(key)}/></div>)}
        </div>
        <button data-testid={`${dataTestId}_add`} onClick={() => push("Cheese")}>+</button>
        <button data-testid={`${dataTestId}_remove`} onClick={() => value.length > 0 && remove(value[value.length - 1])}>-</button>
        <button onClick={() => value.length > 0 && set(slice(0, value.length - 1))}>--</button>
        <button data-testid={`${dataTestId}_kill`} onClick={() => set(undefined)}>clear</button>
        <button onClick={() => replace(["NOT CHEESE"])}>replace</button>
    </div>;
}

function SimpleTextBox({errorTestId, ...props}) {
    const [value, change] = useConsume(props.name);
    const [hasErrors, errors] = useConsumeErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value || undefined);
        }}/>
        <ul data-testid={errorTestId || `${props.name}_errors`}>{hasErrors && errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>
    </span>;
}

function Alias(props) {
    const [alias] = useConsumeArray(props.name);
    return <ul data-testid={props.name}>
        {alias.map((obj, idx) => <li key={idx}>{obj.alias}</li>)}
    </ul>;
}

function AllOrNothing ({name}){
    return <SubSchema path={name}>
        <div>
            <span>Thing 1</span>
            <TextBoxArray dataTestId="aonthing1" name="aonthing1" buttonId="aonthing1"/>
        </div>
        <div>
            <span>Thing 2</span>
            <SimpleTextBox data-testid="aonthing2" name="aonthing2"/>
        </div>
        <div>
            <span>Thing 3</span>
            <SimpleTextBox data-testid="aonthing3" name="aonthing3"/>
        </div>
    </SubSchema>;
}

function DeepAllOrNothing({name}) {
    const [items, set, {push}] = useConsumeArray(name);
    return <span><SubSchema path={name}>{items.map((item, itemIdx) => <DeepAllOrNothingItem key={itemIdx} name={itemIdx}/>)}</SubSchema><button data-testid="deepAllOrNothing_add" onClick={() => push({})}>add DAON</button></span>;
}

function DeepAllOrNothingItem ({name}){
    return <SubSchema path={name}>
        <div>
            <span>Thing 1</span>
            <TextBoxArray dataTestId={`daonthing1_${name}`} name="daonthing1"/>
        </div>
        <div>
            <span>Thing 2</span>
            <SimpleTextBox data-testid={`daonthing2_${name}`} errorTestId={`daonthing2_${name}_errors`} name="daonthing2"/>
        </div>
        <div>
            <span>Thing 3</span>
            <SimpleTextBox data-testid={`daonthing3_${name}`} errorTestId={`daonthing3_${name}_errors`} name="daonthing3"/>
        </div>
    </SubSchema>;
}

function DemoForm() {
    return useSchema(props => {
        const {formData, validate, ready, errorMap} = props;
        const [valid, setValid] = useState('Unknown');
        if(!ready) {
            return <div>Loading...</div>;
        }

        return useObserver(() => <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
            <div>
                <span>Last Name</span>
                <SimpleTextBox data-testid="lastName" name="lastName"/>
            </div>
            <Alias name={"alias"}/>
            <AllOrNothing name="allOrNothing"/>
            <DeepAllOrNothing name="deepAllOrNothing"/>
            <div>
                <span>Other</span>
                <SimpleTextBox data-testid="dep1" name="dep1"/>
            </div>
            <div>
                <span>If Other is set I should be Required</span>
                <SimpleTextBox data-testid="dep2" name="dep2"/>
            </div>
            <div data-testid="pepsi">{formData.firstName}</div>
            <div data-testid="coke">{formData.lastName}</div>
            <div>
                <button data-testid="v" onClick={() => {
                    if(validate()) {
                        setValid("VALID");
                    } else {
                        setValid("INVALID");
                    }
                }}>Validate
                </button>
            </div>
            {valid !== 'Unknown' && <div data-testid="validated">{valid}</div>}
            <div data-testid="valid">{valid}</div>
            <ul data-testid="errorMapContainer">{errorMap && errorMap.size > 0 && getFlattenedErrors(errorMap).map((e, eIdx) => <li key={eIdx}>{e.path.join("/")} : {e.message} : {JSON.stringify(toJS(formData))}</li>)}</ul>
        </div>);
    }, {
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
        default: {
            firstName: "Foo",
            middleName: "J",
            lastName: "Bar",
            alias: [],
            deepAllOrNothing: [{}]
        },
        actions: formData => ({
            addAlias(alias) {
                formData.alias.push({alias: alias});
            },
            clearAliases() {
                formData.alias.length = 0;
            },
            spliceAlias(idx) {
                formData.alias.splice(idx, 1);
            },
        }),
    });
}

function oneCharAtATime(text, event){
    for(let i=1;i<=text.length;i++){
        event(text.substring(0,i));
    }
}

afterEach(cleanup);

test("Test the base All or Nothing validation using dependencies keyword", async () => {
    let {getByTestId} = render(<DemoForm/>);

    await wait(() => getByTestId("aonthing1_errors"));
    //Check to make sure everything is nothing
    expect(getByTestId("aonthing1_errors").innerHTML).toBe('');
    expect(getByTestId("aonthing2").value).toBe('');
    expect(getByTestId("aonthing3").value).toBe('');

    expect(getByTestId("valid").innerHTML).toBe('Unknown');
    expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

    fireEvent.click(getByTestId("v"));

    expect(getByTestId("valid").innerHTML).toBe('VALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

    // fireEvent.change(getByTestId("aonthing2"), {target: {value: "Fart"}});

    fireEvent.click(getByTestId("aonthing1_add"));
    // fireEvent.change(getByTestId("aonthing1"), {target: {value: "Cheese"}});
    expect(getByTestId("aonthing1_errors").className).toBe('');
    expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);

    fireEvent.click(getByTestId("v"));

    expect(getByTestId("valid").innerHTML).toBe('INVALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);

    fireEvent.change(getByTestId("aonthing2"), {target: {value: "Fart"}});

    fireEvent.click(getByTestId("v"));
    expect(getByTestId("valid").innerHTML).toBe('INVALID');

    fireEvent.change(getByTestId("aonthing3"), {target: {value: "Time"}});
    fireEvent.click(getByTestId("v"));

    expect(getByTestId("valid").innerHTML).toBe('VALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

    fireEvent.click(getByTestId("v"));

    expect(getByTestId("valid").innerHTML).toBe('VALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);


    //Deep all or nothing dependecies
    fireEvent.click(getByTestId("daonthing1_0_add"));
    expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing1_0_errors").className).toBe("");
    expect(getByTestId("daonthing2_0_errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeGreaterThan(0);


    oneCharAtATime("Flower Sniffers United is Your Favourite Charity!", (text) => {
        fireEvent.change(getByTestId("daonthing2_0"), {target: {value: text}});
        console.log(getByTestId("daonthing2_0").value);
        console.log(getByTestId("daonthing2_0_errors").innerHTML);
        expect(getByTestId("daonthing2_0_errors").childNodes.length).toBe(0);
        try {
            expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeGreaterThan(0);
        } catch(err){
            console.log(err);
        }
        // expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeLessThan(2);
        expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);
        fireEvent.click(getByTestId("daonthing1_0_remove"));
        expect(getByTestId("daonthing1_0_errors").className).toBe('error');
        fireEvent.click(getByTestId("daonthing1_0_add"));
        expect(getByTestId("daonthing1_0_errors").className).toBe("");
    });

    expect(getByTestId("daonthing2_0").value).toBe("Flower Sniffers United is Your Favourite Charity!");


    fireEvent.click(getByTestId("v"));
    expect(getByTestId("valid").innerHTML).toBe('INVALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);

    oneCharAtATime("Flower Sniffers United is Your Favourite Charity!", (text) => {
        fireEvent.change(getByTestId("daonthing2_0"), {target: {value: text}});
        expect(getByTestId("daonthing2_0_errors").childNodes.length).toBe(0);
        expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeGreaterThan(0);
        // expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeLessThan(2);
        expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);
        fireEvent.click(getByTestId("daonthing1_0_remove"));
        expect(getByTestId("daonthing1_0_errors").className).toBe('error');
        fireEvent.click(getByTestId("daonthing1_0_add"));
        expect(getByTestId("daonthing1_0_errors").className).toBe("");
    });

    expect(getByTestId("daonthing2_0").value).toBe("Flower Sniffers United is Your Favourite Charity!");
    fireEvent.change(getByTestId("daonthing2_0"), {target: {value: ''}});
    fireEvent.click(getByTestId("daonthing1_0_remove"));
    expect(getByTestId("daonthing2_0_errors").childNodes.length).toBe(0);
    expect(getByTestId("daonthing3_0_errors").childNodes.length).toBe(0);
    fireEvent.click(getByTestId("v"));
    expect(getByTestId("valid").innerHTML).toBe('VALID');

    fireEvent.change(getByTestId("daonthing2_0"), {target: {value: "Fart"}});

    expect(getByTestId("daonthing1_0_errors").className).toBe('error');
    expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeGreaterThan(0);

    fireEvent.change(getByTestId("daonthing3_0"), {target: {value: "Time"}});

    expect(getByTestId("daonthing1_0_errors").className).toBe('error');

    fireEvent.click(getByTestId("daonthing1_0_add"));

    expect(getByTestId("daonthing1_0_errors").className).toBe('');
    expect(getByTestId("daonthing2_0_errors").childNodes.length).toBe(0);
    expect(getByTestId("daonthing3_0_errors").childNodes.length).toBe(0);

    fireEvent.change(getByTestId("daonthing2_0"), {target: {value: ''}});
    fireEvent.change(getByTestId("daonthing3_0"), {target: {value: ''}});

    // console.log(getByTestId("errorMapContainer").innerHTML);

    expect(getByTestId("daonthing1_0_errors").className).toBe('');
    expect(getByTestId("daonthing2_0_errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeGreaterThan(0);

    fireEvent.click(getByTestId("deepAllOrNothing_add"));

    expect(getByTestId("daonthing1_0_errors").className).toBe('');
    expect(getByTestId("daonthing2_0_errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing2_1_errors").childNodes.length).toBe(0);
    expect(getByTestId("daonthing3_1_errors").childNodes.length).toBe(0);

    fireEvent.click(getByTestId("daonthing1_0_add"));

    expect(getByTestId("daonthing2_0_errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeGreaterThan(0);
    // expect(getByTestId("daonthing2_1_errors").childNodes.length).toBeGreaterThan(0);
    // expect(getByTestId("daonthing3_1_errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing2_1_errors").childNodes.length).toBe(0);
    expect(getByTestId("daonthing3_1_errors").childNodes.length).toBe(0);

    fireEvent.click(getByTestId("daonthing1_1_add"));

    expect(getByTestId("daonthing2_0_errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing2_1_errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing3_1_errors").childNodes.length).toBeGreaterThan(0);

    fireEvent.click(getByTestId("daonthing1_1_remove"));

    expect(getByTestId("daonthing2_0_errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeGreaterThan(0);
    console.log(getByTestId("daonthing3_1_errors").innerHTML);
    expect(getByTestId("daonthing2_1_errors").childNodes.length).toBe(0);
    expect(getByTestId("daonthing3_1_errors").childNodes.length).toBe(0);

    fireEvent.click(getByTestId("deepAllOrNothing_add"));

    fireEvent.change(getByTestId("daonthing2_0"), {target: {value: "Fart"}});

    expect(getByTestId("daonthing2_0_errors").childNodes.length).toBe(0);
    expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeGreaterThan(0);
    // expect(getByTestId("daonthing2_1_errors").childNodes.length).toBeGreaterThan(0);
    // expect(getByTestId("daonthing3_1_errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing2_1_errors").childNodes.length).toBe(0);
    expect(getByTestId("daonthing3_1_errors").childNodes.length).toBe(0);

    fireEvent.click(getByTestId("deepAllOrNothing_add"));
    fireEvent.click(getByTestId("deepAllOrNothing_add"));

    expect(getByTestId("daonthing2_0_errors").childNodes.length).toBe(0);
    expect(getByTestId("daonthing3_0_errors").childNodes.length).toBeGreaterThan(0);
    // expect(getByTestId("daonthing2_1_errors").childNodes.length).toBeGreaterThan(0);
    // expect(getByTestId("daonthing3_1_errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("daonthing2_1_errors").childNodes.length).toBe(0);
    expect(getByTestId("daonthing3_1_errors").childNodes.length).toBe(0);
});
