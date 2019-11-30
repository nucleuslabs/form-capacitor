import {
    setError,
    delErrorNode,
    getErrorNode,
    getErrors,
    getFlattenedErrors,
    setErrors
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

describe('delErrorNode', function() {
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
        delErrorNode(errorMap,['AllorNothing', 'aonthing1']);
        expect(getErrors(errorMap,['firstName'])[0]).toEqual(firstName);
        expect(getErrors(errorMap,['firstName'])[1]).toEqual(firstName2);
        expect(getErrors(errorMap,['AllorNothing', 'aonthing1','0'])).toEqual([]);
        expect(getErrors(errorMap,['AllorNothing', 'aonthing1'])).toEqual([]);

    });
});