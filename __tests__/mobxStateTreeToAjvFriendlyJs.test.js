import testSchema from './demo-form';
import jsonSchemaToMST from "../src/jsonSchemaToMST";
import $RefParser from 'json-schema-ref-parser';
import {getValue, setValue} from "../src";
import {watchForPatches, createAjvObject} from "../src/validation";
import mobxTreeToSimplifiedObjectTree from "../src/mobxTreeToSimplifiedObjectTree";
import {destroy} from "mobx-state-tree";

describe('In Regards to data converted by mobxStateTreeToAjvFriendlyJs', function() {
    it('It should convert empty arrays, maps and objects to undefined and leave every other variable as is.', async function() {
        const parser = new $RefParser();
        let schemaPromise = parser.dereference(testSchema);
        schemaPromise = schemaPromise.then(() => parser.$refs.get("#/definitions/DemoForm"));
        let schema = await schemaPromise;
        let Model = jsonSchemaToMST(schema);
        Model = Model.actions(self => ({
            set(name, value) {
                setValue(self, name, value);
            },
            remove(name) {
                const node = getValue(self, name);
                destroy(node);
            }
        }));
        const ajv = createAjvObject();
        let mobxStateTree = Model.create({});
        const {validate} = watchForPatches(schema, mobxStateTree, ajv);
        mobxStateTree.set("firstName", undefined);
        mobxStateTree.set("firstName", "Hello");
        mobxStateTree.set("lastName", "World");
        mobxStateTree.set("middleName", "MF");
        const testTree = mobxTreeToSimplifiedObjectTree(mobxStateTree);
        expect(mobxTreeToSimplifiedObjectTree(mobxStateTree.contacts[0])).toEqual({});
        expect(testTree.firstName).toEqual("Hello");
        expect(testTree.alias).toBeUndefined();
        expect(testTree.alias2).toBeUndefined();
        expect(testTree.contacts).toEqual([{}]);
        expect(testTree.allOrNothing).toEqual(undefined);

        const passed = validate(mobxTreeToSimplifiedObjectTree(mobxStateTree));
        expect(passed).toBeTrue();

        mobxStateTree.set("firstName", undefined);
        mobxStateTree.set("lastName", undefined);
        mobxStateTree.set("middleName", undefined);
        mobxStateTree.set("contacts", []);
        mobxStateTree.remove('allOrNothing');
        expect(mobxTreeToSimplifiedObjectTree(mobxStateTree)).toEqual({});
    });
});
