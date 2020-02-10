import testSchema from './demo-form';
import jsonSchemaToMST from "../src/jsonSchemaToMST";
import $RefParser from 'json-schema-ref-parser';
import {setValue} from "../src";
import {toJS} from "mobx";


//tests requiring mobx state tree
describe('jsonSchemaToMST', function() {
    it('Should set create a nice friendly MobX State tree equipped with actions and fun', async function() {
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
        let mobxStateTree = Model.create({});
        mobxStateTree.set(["firstName"], "Awesome");
        expect(mobxStateTree.firstName).toEqual('Awesome');
        expect(mobxStateTree.lastName).toEqual(undefined);
        mobxStateTree.set(["lastName"], "sauce");
        expect(mobxStateTree.alias).toEqual([]);
        expect(toJS(mobxStateTree)).toMatchObject({
            firstName: "Awesome",
            lastName: 'sauce',
            alias: []
        });
    });
});