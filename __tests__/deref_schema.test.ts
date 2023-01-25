import {DerefSchema} from '../src/deref_schema';
import { Schema } from '@cfworker/json-schema';
import fs from 'fs';

describe('DerefSchema module', () => {

  describe('calling create', () => {

    let schema: Schema;
    let subSchema: Schema;

    beforeEach(()=> {
        schema = {
            $ref: 'test.json',
            $id: "https://deref_schema.com/schema.json"
        };
        subSchema = {
            type: "number",
            $id: "subschema.json"
        };
    });

    test('calling create with $ref reads subschema', () => {
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(subSchema));
        const derefSchema: DerefSchema = DerefSchema.create(schema);
        expect(fs.readFileSync).toHaveBeenCalledWith('test.json', 'utf-8');
        expect(derefSchema.getSchemasAded()).toEqual(new Set(['test.json']));
    });

    test('calling create with $ref reads subschema when ref value has #/definitions', () => {
        schema['$ref'] = 'test.json#/definitions/test';
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(subSchema));
        const derefSchema: DerefSchema = DerefSchema.create(schema);
        expect(fs.readFileSync).toHaveBeenCalledWith('test.json', 'utf-8');
        expect(derefSchema.getSchemasAded()).toEqual(new Set(['test.json']));
    });

    test('calling create with $ref adds subschema from subschema', () => {
        const subSchema: Schema = {
            $id: "subschema.json",
            definitions: {
                example: {
                    type: "boolean"
                },
                something: {
                    $ref: "something.json"
                },
                other: {
                    $ref: "other.json"
                }
            }
        };
        jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(JSON.stringify(subSchema))
            .mockReturnValueOnce(JSON.stringify({type: 'number', $id: 'something.json'}))
            .mockReturnValue(JSON.stringify({type: 'number', $id: 'other.json'}));
        const derefSchema: DerefSchema = DerefSchema.create(schema);
        expect(fs.readFileSync).toHaveBeenCalledWith('test.json', 'utf-8');
        expect(fs.readFileSync).toHaveBeenCalledWith('other.json', 'utf-8');
        expect(derefSchema.getSchemasAded()).toEqual(new Set(['test.json', 'other.json', 'something.json']));
    });

  });

});