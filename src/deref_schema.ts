import { Validator } from '@cfworker/json-schema';
import { readFileSync } from 'fs';
import path from 'path';

interface RefObject {
    $ref: string;
}

export class DerefSchema {

    static dereference(schema: object, validator: Validator, basePath: string) {
        const schemasAdded = new Set<string>();
        this.findRefs(schema, schemasAdded, ref => this.addSchema(ref, schemasAdded, validator, basePath));
    }

    static findRefs(schema: object, schemasAdded: Set<string>, callback: (r: RefObject) => object) {
        if (Array.isArray(schema)) {
            schema.forEach((item) => this.findRefs(item, schemasAdded, callback));
            return;
        }
        if (typeof schema === 'object') {
            if (schema['$ref'] !== undefined) {
                const refSchema = callback(schema as RefObject);
                refSchema && this.findRefs(refSchema, schemasAdded, callback);
                return;
            }
            Object.keys(schema).forEach(key => this.findRefs(schema[key], schemasAdded, callback));
        }
    }

    static addSchema(ref: RefObject, schemasAdded: Set<string>, validator: Validator, basePath: string) : object {
        const refValue = ref.$ref;
        if (refValue[0] === '#') {
            return;
        }
        if (!schemasAdded.has(refValue)) {
            const filePath = basePath ? path.resolve(basePath, refValue) : refValue;
            const refSchema = JSON.parse(readFileSync(filePath, 'utf-8')) as object;
            schemasAdded.add(refValue);
            validator.addSchema(refSchema);
            return refSchema;
        }
    }
}