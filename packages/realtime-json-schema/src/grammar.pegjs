// https://github.com/pegjs/pegjs/blob/master/examples/javascript.pegjs
// https://bitbucket.org/mnpenner/async-lang/src/6e6e69119eb22cca4a477ae7483a8043dbf51673/lang/async/grammar.pegjs
// https://bitbucket.org/mnpenner/async-lang/src/6e6e69119eb22cca4a477ae7483a8043dbf51673/lang/pql/grammar.pegjs


  
Program = _ x:AssignmentList _ {
	return x
}

Schema = "schema" _ id:(Identifier _)? schema:SchemaDef {
	return Node('SchemaDeclaration',{name: id ? id[0].name : null, schema})
}

Assignment = id:IdentifierName _ '=' _ value:SchemaPropertyValue {
	return Node('Assignment',{name: id.name,value})
}

AssignmentList = a:Assignment b:(_ Assignment)* {
	return list(a,b)
}

SchemaDef 
	= "(" _ definition:SchemaNameAndValueList _ ")" {  
	 //console.log('x',x);
	 return Schema({definition});
 }

SchemaNameAndValueList = a:SchemaAssignment b:(PropertySeparator SchemaAssignment)* (_ ",")? { 
	let o = Object.create(null);
	
	for(let [k,v] of list(a,b)) {
		o[k] = v;
	}
	return o
}

SchemaPropertyPair = key: PropertyName PropertyValueSeparator value: SchemaPropertyValue {
	return [key,value]
}
SchemaPropertyValue = Literal / SchemaDef / TypeWithExt

//SchemaProperties = "title" / "description" / "default" / "type"

SchemaAssignment = key: PropertyName PropertyValueSeparator  value: SchemaPropertyValue {
                   	return [key,value]
                   }

ObjectSchemaOptions = Schema_properties

SharedSchemaOptions = TitleDef / TypeDef / DefaultDef / DescriptionDef

PropertyNameAndSchemaList = a:SchemaPropertyAssignment b:(PropertySeparator SchemaPropertyAssignment)* (_ "," )? { return list(a,b) }

SchemaPropertyAssignment = key: PropertyName opt:(_ "?")? PropertyValueSeparator value:SchemaDef { return {key,value,optional:!!opt} }

ObjectSchema 
	= "{" _ "}" { return Node('objectSchema',Object.create(null)) } 
	/ "{" _ propList:PropertyNameAndSchemaList _ "}" { 
               		let o = Object.create(null);
               		let required = [];
               		
               		for(let p of propList) {
               			o[p.key] = p.value;
               			
               			if(!p.optional) {
               			    required.push(p.key);
               			}
               		}
               		return Node('objectSchema',{properties:o,required})
               	}


PropertyValueSeparator = _ (":" _)?

	
TitleDef = "title" PropertyValueSeparator str:StringLiteral {
	return Node('title',str)
}

DescriptionDef = "description" PropertyValueSeparator str:StringLiteral {
	return Node('description',str)
}


DefaultDef = "default" PropertyValueSeparator lit:Literal {
	return Node('default', lit)
}

TypeDef = "type" PropertyValueSeparator x:TypeWithExt {
	return x
}

Schema_properties = "properties" PropertyValueSeparator x:ObjectSchema {
	return x
}

Type = BasicType / ObjectSchema

TypeWithExt = kind:$BasicType rules:TypeExt? {
	return Type(kind,rules)
}

TypeExt = "<" _ x:(SchemaNameAndValueList _)? ">" { return x ? x[0] : [] }

BasicTypes = "String" / "Number" / "Object" / "Array" / "Boolean" {
	return 'xxx'
}

BasicType = x:BasicTypes {
	return Node('basicType',x)
}

ArraySchemaOptions = Array_minLength / Array_maxLength / Array_items
NumberSchemaOptions = Number_minimum / Number_maximum / Number_multipleOf
StringSchemaOptions = String_pattern / String_minLength / String_maxLength

// todo: these options should be context-sensitive
// so that "minLength" can mean something different if applied to a string vs an array
Array_minLength = "minItems" PropertyValueSeparator value:NumericLiteral {
	return Node('Array_minLength',value)
}

Array_maxLength = "maxItems" PropertyValueSeparator value:NumericLiteral {
	return Node('Array_maxLength',value)
}
Array_items = "items" PropertyValueSeparator x:TypeWithExt {
	return Node('Array_items',x)
}

Number_minimum = "minimum" PropertyValueSeparator value:NumericLiteral {
	return Node('Number_minimum',value)
}

Number_maximum = "maximum" PropertyValueSeparator value:NumericLiteral {
	return Node('Number_maximum',value)
}
Number_multipleOf = "multipleOf" PropertyValueSeparator value:NumericLiteral {
	return Node('Number_multipleOf',value)
}

String_pattern = "pattern" PropertyValueSeparator value:(RegularExpressionLiteral / StringLiteral) {
	return Node('String_pattern',value)
}

String_minLength = "minLength" PropertyValueSeparator value:NumericLiteral {
	return Node('String_minLength',value)
}

String_maxLength = "maxLength" PropertyValueSeparator value:NumericLiteral {
	return Node('String_maxLength',value)
}

PropertySeparator
	= _ "," _ 
	/ WhiteComment LineTerminatorSequence _

ArraySeparator
	= _ "," _ / _

PropertyNameAndValueList = a:PropertyAssignment b:(PropertySeparator PropertyAssignment)* (_ "," )? { return list(a,b) }

ValueList = a:Literal b:(ArraySeparator Literal)* (_ "," )? { return list(a,b) }

PropertyAssignment = key: PropertyName PropertyValueSeparator value:SchemaPropertyValue { return {key,value} }

PropertyName = x:IdentifierName { return x.name } / x:StringLiteral { return x.value } / x:NumericLiteral { return String(x.value) }

ObjectLiteral 
	= "{" _ "}" {
                	return Literal(EMPTY_OBJECT)
                }
	/ "{" _ properties:PropertyNameAndValueList _ "}" { 
		let o = Object.create(null);
		//console.log('properties',properties);
		for(let p of properties) {
			o[p.key] = p.value;
		}
		return ObjectExpression(o)
	}

ArrayLiteral 
	= "[" _ "]" {
                	return ArrayExpression(EMPTY_ARRAY)
                }
	/ "[" _ values:ValueList _ "]" { 
		return ArrayExpression(values);
	}