import {
    setError,
    getErrorNode,
    getErrors,
    getFlattenedErrors,
    setErrors, deleteAllNodes, deleteOwnNode, deleteAllThatAreNotInMap, hasError
} from '../src/errorMapping';
import {observable} from "mobx";

describe('setError', function() {
    it('Should set an arrays of error objects in an error map', function() {
        const errorMap = observable.map();
        const firstName = {title: "First Name", message: "There is no First Name!!!"};
        const firstName2 = {title: "First Name", message: "Yet another error?"};
        const aonthing1 = {title: "All or Nothing Array", message: "Array test action"};
        const aonthing1_0 = {title: "All or Nothing Item 1", message: "It is Tuesday"};
        setError(errorMap, ['firstName'], firstName);
        expect(errorMap.get('children').get('firstName').get('errors')[0]).toEqual(firstName);
        setError(errorMap, ['AllorNothing', 'aonthing1','0'], aonthing1_0);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('children').get('0').get('errors')[0]).toEqual(aonthing1_0);
        setError(errorMap, ['AllorNothing', 'aonthing1'], aonthing1);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[0]).toEqual(aonthing1);
        setError(errorMap, ['firstName'], firstName2);
        expect(errorMap.get('children').get('firstName').get('errors')[1]).toEqual(firstName2);
    });
});

describe('setErrors', function() {
    it('Should set an arrays of error objects in an error map', function() {
        const errorMap = observable.map();
        const firstName = {title: "First Name", message: "There is no First Name!!!"};
        const firstName2 = {title: "First Name", message: "Yet another error?"};
        const aonthing1 = {title: "All or Nothing Array", message: "Array test action"};
        const aonthing1_0 = {title: "All or Nothing Array", message: "Array test action2"};
        setErrors(errorMap, ['firstName'], [firstName, firstName2]);
        expect(errorMap.get('children').get('firstName').get('errors')[0]).toEqual(firstName);
        expect(errorMap.get('children').get('firstName').get('errors')[1]).toEqual(firstName2);
        setErrors(errorMap, ['AllorNothing', 'aonthing1'], [aonthing1, aonthing1_0]);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[0]).toEqual(aonthing1);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[1]).toEqual(aonthing1_0);
    });
});

describe('getError', function() {
    it('Should get an error object in an error map', function() {
        const errorMap = observable.map();
        const firstName = {title: "First Name", message: "There is no First Name!!!"};
        const firstName2 = {title: "First Name", message: "Yet another error?"};
        const aonthing1 = {title: "All or Nothing Array", message: "Array test action"};
        const aonthing1_0 = {title: "All or Nothing Item 1", message: "It is Tuesday"};
        setError(errorMap, ['firstName'], firstName);
        setError(errorMap, ['AllorNothing', 'aonthing1','0'], aonthing1_0);
        setError(errorMap, ['AllorNothing', 'aonthing1'], aonthing1);
        setError(errorMap, ['firstName'], firstName2);
        expect(getErrors(errorMap,['firstName'])[0]).toEqual(firstName);
        expect(getErrors(errorMap,['firstName'])[1]).toEqual(firstName2);
        expect(getErrors(errorMap,['AllorNothing', 'aonthing1'])[0]).toEqual(aonthing1);
        expect(getErrors(errorMap,['AllorNothing', 'aonthing1','0'])[0]).toEqual(aonthing1_0);
        expect(getErrors(errorMap,['lastName'])).toEqual([]);
        expect(getErrors(errorMap,['some', 'deep', 'path'])).toEqual([]);
    });
});

describe('getErrorNode', function() {
    it('Should get an error Node from an error map', function() {
        const errorMap = observable.map();
        const firstName = {title: "First Name", message: "There is no First Name!!!"};
        const firstName2 = {title: "First Name", message: "Yet another error?"};
        const aonthing1 = {title: "All or Nothing Array", message: "Array test action"};
        const aonthing1_0 = {title: "All or Nothing Item 1", message: "It is Tuesday"};
        setError(errorMap, ['firstName'], firstName);
        setError(errorMap, ['AllorNothing', 'aonthing1','0'], aonthing1_0);
        setError(errorMap, ['AllorNothing', 'aonthing1'], aonthing1);
        setError(errorMap, ['firstName'], firstName2);
        expect(getErrorNode(errorMap,['firstName']).get("errors")[0]).toEqual(firstName);
        expect(getErrorNode(errorMap,['firstName']).get("errors")[1]).toEqual(firstName2);
        expect(getErrorNode(errorMap,['AllorNothing', 'aonthing1']).get("errors")[0]).toEqual(aonthing1);
        expect(getErrorNode(errorMap,['AllorNothing', 'aonthing1','0']).get("errors")[0]).toEqual(aonthing1_0);
        expect(getErrorNode(errorMap,['AllorNothing']).get("children").get('aonthing1')).toEqual(getErrorNode(errorMap,['AllorNothing', 'aonthing1']));
        expect(getErrorNode(errorMap,['AllorNothing', 'aonthing1']).get("children").get('0')).toEqual(getErrorNode(errorMap,['AllorNothing', 'aonthing1','0']));
    });
});


describe('getFlattenedErrors', function() {
    it('Should convert a whole Error Map from a tree to an array', function() {
        const errorMap = observable.map();
        const firstName2 = {title: "First Name", message: "Yet another error?"};
        const aonthing1_0 = {title: "All or Nothing Item 1", message: "It is Tuesday"};
        const aonthing1 = {title: "All or Nothing Array", message: "Array test action"};
        const firstName = {title: "First Name", message: "There is no First Name!!!"};
        setError(errorMap, ['firstName'], firstName);
        setError(errorMap, ['AllorNothing', 'aonthing1','0'], aonthing1_0);
        setError(errorMap, ['AllorNothing', 'aonthing1'], aonthing1);
        setError(errorMap, ['firstName'], firstName2);
        expect(getFlattenedErrors(errorMap).length).toEqual(4);
        expect(getFlattenedErrors(errorMap)[0]).toEqual(firstName);
        expect(getFlattenedErrors(errorMap)[1]).toEqual(firstName2);
        expect(getFlattenedErrors(errorMap)[2]).toEqual(aonthing1);
        expect(getFlattenedErrors(errorMap)[3]).toEqual(aonthing1_0);
    });
    it('Should convert an interior node in an errorMap to a flat array', function() {
        const errorMap = observable.map();
        const firstName2 = {title: "First Name", message: "Yet another error?"};
        const aonthing1_0 = {title: "All or Nothing Item 1", message: "It is Tuesday"};
        const aonthing1 = {title: "All or Nothing Array", message: "Array test action"};
        const firstName = {title: "First Name", message: "There is no First Name!!!"};
        setError(errorMap, ['firstName'], firstName);
        setError(errorMap, ['AllorNothing', 'aonthing1','0'], aonthing1_0);
        setError(errorMap, ['AllorNothing', 'aonthing1'], aonthing1);
        setError(errorMap, ['firstName'], firstName2);
        expect(getFlattenedErrors(errorMap, ['AllorNothing']).length).toEqual(2);
        expect(getFlattenedErrors(errorMap, ['AllorNothing'])[0]).toEqual(aonthing1);
        expect(getFlattenedErrors(errorMap, ['AllorNothing'])[1]).toEqual(aonthing1_0);
    });
});

describe('deleteAllNodes', function() {
    it('Should delete an errorNode from an error map', function() {
        const errorMap = observable.map();
        const firstName = {title: "First Name", message: "There is no First Name!!!"};
        const firstName2 = {title: "First Name", message: "Yet another error?"};
        const aonthing1 = {title: "All or Nothing Array", message: "Array test action"};
        const aonthing1_0 = {title: "All or Nothing Item 1", message: "It is Tuesday"};
        setError(errorMap, ['firstName'], firstName);
        setError(errorMap, ['AllorNothing', 'aonthing1','0'], aonthing1_0);
        setError(errorMap, ['AllorNothing', 'aonthing1'], aonthing1);
        setError(errorMap, ['firstName'], firstName2);
        expect(getErrors(errorMap,['AllorNothing', 'aonthing1'])[0]).toEqual(aonthing1);
        expect(getErrors(errorMap,['AllorNothing', 'aonthing1','0'])[0]).toEqual(aonthing1_0);
        deleteAllNodes(errorMap,['AllorNothing', 'aonthing1']);
        // console.log(JSON.stringify(toJS(errorMap),undefined, 2));
        expect(getErrors(errorMap,['firstName'])[0]).toEqual(firstName);
        expect(getErrors(errorMap,['firstName'])[1]).toEqual(firstName2);
        expect(getErrors(errorMap,['AllorNothing', 'aonthing1','0'])[0]).toEqual(aonthing1_0);
        expect(getErrors(errorMap,['AllorNothing', 'aonthing1'])).toEqual([]);

    });
});

describe('deleteAllIncludingRelatedErrors', function() {
    it('Should set an arrays of error objects in an error map', function() {
        const errorMap = observable.map();
        const firstName = {title: "First Name", message: "There is no First Name!!!"};
        const firstName2 = {title: "First Name", message: "Yet another error?"};
        const aonthing1 = {title: "All or Nothing Array", message: "Array test action"};
        const aonthing1_0 = {title: "All or Nothing Array", message: "Array test action2"};
        const aonthing2 = {title: "All or Nothing Item 2", message: "It is Tuesday"};
        const aonthing2_0 = {title: "All or Nothing Item 2 B", message: "It is Not Tuesday"};
        setErrors(errorMap, ['firstName'], [firstName, firstName2]);
        expect(errorMap.get('children').get('firstName').get('errors')[0]).toEqual(firstName);
        expect(errorMap.get('children').get('firstName').get('errors')[1]).toEqual(firstName2);
        setErrors(errorMap, ['AllorNothing', 'aonthing1'], [aonthing1, aonthing1_0]);
        setError(errorMap, ['AllorNothing', 'aonthing2'], aonthing2, ['AllorNothing', 'aonthing1']);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[0]).toEqual(aonthing1);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[1]).toEqual(aonthing1_0);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[0]).toEqual(aonthing2);
        deleteAllNodes(errorMap,['AllorNothing', 'aonthing1']);
        expect(errorMap.get('children').has('AllorNothing')).toBeFalse();
        setErrors(errorMap, ['AllorNothing', 'aonthing1'], [aonthing1, aonthing1_0]);
        setError(errorMap, ['AllorNothing', 'aonthing2'], aonthing2, ['AllorNothing', 'aonthing1']);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[0]).toEqual(aonthing1);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[1]).toEqual(aonthing1_0);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[0]).toEqual(aonthing2);
        setError(errorMap, ['AllorNothing', 'aonthing2'], aonthing2);
        setError(errorMap, ['AllorNothing', 'aonthing2'], aonthing2_0);
        // console.log(JSON.stringify(toJS(errorMap),undefined, 2));
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[1]).toEqual(aonthing2_0);
        deleteAllNodes(errorMap,['AllorNothing', 'aonthing1']);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[0]).toEqual(aonthing2_0);
        deleteAllNodes(errorMap,['AllorNothing', 'aonthing2']);
        expect(errorMap.get('children').has('AllorNothing')).toBeFalse();
    });
});

describe('deleteOwnErrors', function() {
    it('Should delete only the errors directly on a specific node but not the related errors', function() {
        const errorMap = observable.map();
        const firstName = {title: "First Name", message: "There is no First Name!!!"};
        const firstName2 = {title: "First Name", message: "Yet another error?"};
        const aonthing1 = {title: "All or Nothing Array", message: "Array test action"};
        const aonthing1_0 = {title: "All or Nothing Array", message: "Array test action2"};
        const aonthing2 = {title: "All or Nothing Item 2", message: "It is Tuesday"};
        const aonthing2_0 = {title: "All or Nothing Item 2 B", message: "It is Not Tuesday"};
        setErrors(errorMap, ['firstName'], [firstName, firstName2]);
        expect(errorMap.get('children').get('firstName').get('errors')[0]).toEqual(firstName);
        expect(errorMap.get('children').get('firstName').get('errors')[1]).toEqual(firstName2);
        setErrors(errorMap, ['AllorNothing', 'aonthing1'], [aonthing1, aonthing1_0]);
        setError(errorMap, ['AllorNothing', 'aonthing2'], aonthing2, ['AllorNothing', 'aonthing1']);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[0]).toEqual(aonthing1);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[1]).toEqual(aonthing1_0);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[0]).toEqual(aonthing2);
        deleteOwnNode(errorMap,['AllorNothing', 'aonthing1']);
        expect(errorMap.get('children').has('AllorNothing')).toBeTrue();
        expect(errorMap.get('children').get('AllorNothing').get('children').has('aonthing1')).toBeFalse();
        expect(errorMap.get('children').get('AllorNothing').get('children').has('aonthing2')).toBeTrue();
        setErrors(errorMap, ['AllorNothing', 'aonthing1'], [aonthing1, aonthing1_0]);
        setError(errorMap, ['AllorNothing', 'aonthing2'], aonthing2, ['AllorNothing', 'aonthing1']);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[0]).toEqual(aonthing1);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[1]).toEqual(aonthing1_0);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[0]).toEqual(aonthing2);
        // setError(errorMap, ['AllorNothing', 'aonthing2'], aonthing2);
        setError(errorMap, ['AllorNothing', 'aonthing2'], aonthing2_0);
        // console.log(JSON.stringify(toJS(errorMap),undefined, 2));
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[1]).toEqual(aonthing2_0);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[0]).toEqual(aonthing2);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors').length).toEqual(2);
        deleteOwnNode(errorMap,['AllorNothing', 'aonthing1']);
        expect(errorMap.get('children').get('AllorNothing').get('children').has('aonthing1')).toBeFalse();
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors').length).toEqual(2);
        deleteOwnNode(errorMap,['AllorNothing', 'aonthing2']);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors').length).toEqual(1);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[0]).toEqual(aonthing2);

        // expect(errorMap.get('children').has('AllorNothing')).toBeTrue();
    });
});

describe('deleteAllThatAreNotInMap', function() {
    it('Should delete only the errors directly on a specific node but not the related errors', function() {
        const errorMap = observable.map();
        const firstName = {title: "First Name", message: "There is no First Name!!!"};
        const firstName2 = {title: "First Name", message: "Yet another error?"};
        const aonthing1 = {title: "All or Nothing Array", message: "Array test action"};
        const aonthing1_0 = {title: "All or Nothing Array", message: "Array test action2"};
        const aonthing2 = {title: "All or Nothing Item 2", message: "It is Tuesday"};
        // const aonthing2_0 = {title: "All or Nothing Item 2 B", message: "It is Not Tuesday"};
        setErrors(errorMap, ['firstName'], [firstName, firstName2]);
        expect(errorMap.get('children').get('firstName').get('errors')[0]).toEqual(firstName);
        expect(errorMap.get('children').get('firstName').get('errors')[1]).toEqual(firstName2);
        setErrors(errorMap, ['AllorNothing', 'aonthing1'], [aonthing1, aonthing1_0]);
        setError(errorMap, ['AllorNothing', 'aonthing2'], aonthing2, ['AllorNothing', 'aonthing1']);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[0]).toEqual(aonthing1);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[1]).toEqual(aonthing1_0);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[0]).toEqual(aonthing2);
        // console.log(JSON.stringify(toJS(errorMap),undefined, 2));
        const testMap = new Map([["/AllorNothing/aonthing1", new Map([[aonthing1.message, aonthing1]])], ["/AllorNothing/aonthing2", new Map([[aonthing2.message, aonthing2]])]]);
        deleteAllThatAreNotInMap(errorMap, ['AllorNothing', 'aonthing1'], testMap);
        // console.log(JSON.stringify(toJS(errorMap),undefined, 2));
        expect(errorMap.get('children').has('AllorNothing')).toBeTrue();
        expect(errorMap.get('children').get('AllorNothing').get('children').has('aonthing2')).toBeTrue();
        expect(errorMap.get('children').get('AllorNothing').get('children').has('aonthing1')).toBeTrue();
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[0]).toStrictEqual(aonthing1);
        setErrors(errorMap, ['AllorNothing', 'aonthing1'], [aonthing1, aonthing1_0]);
        setError(errorMap, ['AllorNothing', 'aonthing2'], aonthing2, ['AllorNothing', 'aonthing1']);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors').length).toEqual(2);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[0]).toEqual(aonthing1);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[1]).toEqual(aonthing1_0);
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[0]).toEqual(aonthing2);
        const testMap2 = new Map([["/AllorNothing/aonthing1", new Map([[aonthing1.message, aonthing1]])]]);
        deleteAllThatAreNotInMap(errorMap, ['AllorNothing', 'aonthing1'], testMap2);
        expect(errorMap.get('children').has('AllorNothing')).toBeTrue();
        expect(errorMap.get('children').get('AllorNothing').get('children').has('aonthing2')).toBeFalse();
        expect(errorMap.get('children').get('AllorNothing').get('children').has('aonthing1')).toBeTrue();
        expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors')[0]).toStrictEqual(aonthing1);
        deleteAllThatAreNotInMap(errorMap, ['AllorNothing', 'aonthing1'], new Map());
        expect(errorMap.get('children').has('AllorNothing')).toBeFalse();
        // setError(errorMap, ['AllorNothing', 'aonthing2'], aonthing2);
        // setError(errorMap, ['AllorNothing', 'aonthing2'], aonthing2_0);
        // expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[1]).toEqual(aonthing2_0);
        // expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[0]).toEqual(aonthing2);
        // expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing1').get('errors').length).toEqual(2);
        // deleteOwnNode(errorMap,['AllorNothing', 'aonthing1']);
        // expect(errorMap.get('children').get('AllorNothing').get('children').has('aonthing1')).toBeFalse();
        // expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors').length).toEqual(2);
        // deleteOwnNode(errorMap,['AllorNothing', 'aonthing2']);
        // expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors').length).toEqual(1);
        // expect(errorMap.get('children').get('AllorNothing').get('children').get('aonthing2').get('errors')[0]).toEqual(aonthing2);

        // expect(errorMap.get('children').has('AllorNothing')).toBeTrue();
    });
});

describe('hasError', function() {
    it('Should tell if there are errors for a node', function() {
        const errorMap = observable.map();
        const firstName = {title: "First Name", message: "There is no First Name!!!"};
        expect(hasError(errorMap,['firstName'],firstName)).toBeFalse();
        setError(errorMap, ['firstName'], firstName);
        expect(hasError(errorMap,['firstName'],firstName)).toBeTrue();
    });
});