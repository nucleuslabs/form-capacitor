import stringToPath from "../src/stringToPath";

describe('stringToPath', function() {
    it('should convert a basic string with no delimiters to a an array', function() {
        expect(stringToPath("my")).toEqual(["my"]);
    });
    it('should convert a standard dot delimited path to an array', function() {
        expect(stringToPath("my.super.string")).toEqual(["my","super","string"]);
    });
    it('should convert a dot delimited path with xtra dots to an array', function() {
        expect(stringToPath("my..super..string")).toEqual(["my","","super","","string"]);
    });
    it('should convert a dot delimited path with a dot on the end to an array', function() {
        expect(stringToPath("my.super.string.")).toEqual(["my","super","string",""]);
    });
    it('should convert a dot delimited path with a dot at the start and a dot on the end to an array', function() {
        expect(stringToPath(". my . super. string .")).toEqual([""," my "," super"," string ",""]);
    });
    it('should convert a bracket and dot delimited path to an array', function() {
        expect(stringToPath("my[super]string.yes")).toEqual(["my","super","string","yes"]);
    });
    it('should convert a bracket with dots inside it to an array where the dots inside the brackets are used as part of a path node', function() {
        expect(stringToPath("my[super.string]yes")).toEqual(["my","super.string","yes"]);
    });
    it('should convert quoted things to a node', function() {
        expect(stringToPath("some['super string'].cheese doodles")).toEqual(["some", "super string", "cheese doodles"]);
    });
});