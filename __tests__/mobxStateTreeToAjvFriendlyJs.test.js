import testSchema from './demo-form';
import jsonSchemaToMST from "../src/jsonSchemaToMST";
import $RefParser from 'json-schema-ref-parser';
import {setValue} from "../src";
import {watchForPatches, createAjvObject} from "../src/validation";
import mobxStateTreeToAjvFriendlyJs from "../src/mobxStateTreeToAjvFriendlyJs";



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
            }
        }));
        const ajv = createAjvObject();
        let mobxStateTree = Model.create({});
        const {errors, formData, validate} = watchForPatches(schema, mobxStateTree, ajv);
        mobxStateTree.set("firstName", undefined);
        mobxStateTree.set("firstName", "Hello");
        mobxStateTree.set("lastName", "World");
        mobxStateTree.set("middleName", "MF");
        const testTree = mobxStateTreeToAjvFriendlyJs(mobxStateTree);
        for(let i=0;i<100;i++){
            //here to give a few cycles for stuff to happen
        }
        expect(mobxStateTreeToAjvFriendlyJs(mobxStateTree.contacts[0])).toEqual({});
        expect(testTree.firstName).toEqual("Hello");
        expect(testTree.alias).toBeUndefined();
        expect(testTree.alias2).toBeUndefined();
        expect(testTree.contacts).toBeUndefined();
        expect(testTree.allOrNothing).toBeUndefined();

        const passed = validate(mobxStateTreeToAjvFriendlyJs(mobxStateTree));
        expect(passed).toBeTrue();

        mobxStateTree.set("firstName", undefined);
        mobxStateTree.set("lastName", undefined);
        mobxStateTree.set("middleName", undefined);
        expect(mobxStateTreeToAjvFriendlyJs(mobxStateTree)).toEqual({});
    });
});
