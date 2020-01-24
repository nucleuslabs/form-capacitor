import testSchema from './demo-form';
import jsonSchemaToMST from "../src/jsonSchemaToMST";
import $RefParser from 'json-schema-ref-parser';
import {setValue} from "../src";
import {observable} from "mobx";
import {watchForPatches, createAjvObject, pathToPatchString} from "../src/validation";
import mobxTreeToSimplifiedObjectTree from "../src/mobxTreeToSimplifiedObjectTree";

//tests requiring mobx state tree
describe('watchForPatches', function() {
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
        const {errors, validate} = watchForPatches(schema, mobxStateTree, ajv);
        mobxStateTree.set("firstName", undefined);
        mobxStateTree.set("firstName", "Hello");
        mobxStateTree.set("lastName", "World");
        mobxStateTree.set("middleName", "MF");
        for(let i=0;i<100;i++){
            //here to give a few cycles for stuff to happen
        }
        expect(errors).toEqual(observable.map());
        const passed = validate(mobxTreeToSimplifiedObjectTree(mobxStateTree));
        expect(passed).toBeTrue();
    });
});

describe('pathToPatchString', function() {
    it('Should convert a path array to a mobx-state-tree style patchString.', async function() {
        const path = ['path', 'to', 'data'];
        expect(pathToPatchString(path)).toEqual("/path/to/data");
    });
});