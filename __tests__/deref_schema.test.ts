import {DerefSchema} from '../src/deref_schema';
import fs from 'fs';

describe('DerefSchema module', () => {

  describe('calling create', () => {

    const schema = {
        $ref: 'test.json',
        $id: "https://deref_schema.com/schema.json"
    };

    test('calling create with $ref reads subschema', () => {
        const subSchema = {
            type: "number",
            $id: "https://deref_schema.com/subschema.json"
        };
        //(fs.readFileSync as Mock).mockReturnValue(JSON.stringify(subSchema));
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(subSchema));
        const derefSchema = DerefSchema.create(schema);
        expect(fs.readFileSync).toHaveBeenCalledWith('test.json', 'utf-8');
        expect(derefSchema.getSchemasAded()).toEqual(new Set(['test.json']));
    });

    test('calling create with $ref adds subschema from subschema', () => {
        const subSchema = {
            $id: "https://deref_schema.com/subschema.json",
            definitions: {
                example: {
                    type: "boolean"
                },
                other: {
                    $ref: "other.json#/definitions/other"
                }
            }
        };
        jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(JSON.stringify(subSchema))
            .mockReturnValue(JSON.stringify({type: 'number'}));
        const derefSchema = DerefSchema.create(schema);
        expect(fs.readFileSync).toHaveBeenCalledWith('test.json', 'utf-8');
        expect(fs.readFileSync).toHaveBeenCalledWith('other.json', 'utf-8');
        expect(derefSchema.getSchemasAded()).toEqual(new Set(['test.json', 'other.json']));
    });

  });

});