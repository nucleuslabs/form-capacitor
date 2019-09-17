import testSchema from './demo-form';
import jsonSchemaToMST from "../src/jsonSchemaToMST";
import $RefParser from 'json-schema-ref-parser';
import {setValue} from "../src";
import {toJS,observable} from "mobx";
import {watchForErrorsPatch, createAjvObject} from "../src/validation";

//tests requiring mobx state tree
describe('watchForErrorsPatch', function() {
    it('Should watch a mobx state tree for validation errors and catch observable changes etc.', async function() {
        const parser = new $RefParser();
        let schemaPromise = parser.dereference(testSchema);
        schemaPromise = schemaPromise.then(() => parser.$refs.get("#/definitions/DemoForm"));
        let schema = await schemaPromise;
        let Model = jsonSchemaToMST(schema);
        Model = Model.actions(self => ({
            set(name, value) {
                setValue(self, name, value);
            }
        }));
        const ajv = createAjvObject();
        let mobxStateTree = Model.create({});
        const {errors, validate} = watchForErrorsPatch(schema, mobxStateTree, ajv);
        mobxStateTree.set("firstName", undefined);
        mobxStateTree.set("firstName", "Hello");
        mobxStateTree.set("lastName", "World");
        mobxStateTree.set("middleName", "MF");
        for(let i=0;i<100;i++){
            //here to give a few cycles for stuff to happen
        }
        expect(errors).toEqual(observable.map());
        const passed = validate(toJS(mobxStateTree));
        expect(passed).toBeTrue();
    });
});