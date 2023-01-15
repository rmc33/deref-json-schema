import { Validator, Schema, SchemaDraft } from '@cfworker/json-schema';
import { readFileSync } from 'fs';
import path from 'path';

interface RefObject {
    $ref: string;
}

export class DerefSchema {

    private readonly _schema: Schema;
    private readonly _validator: Validator;
    private readonly _schemasAded: Set<string>;
    public getSchemasAded(): Set<string> {
        return this._schemasAded;
    }
    public getValidator() {
        return this._validator;
    }
    public getSchema() {
        return this._schema;
    }

    constructor(schema: Schema, draft?: SchemaDraft, shortCircuit?: boolean, basePath='') {
        this._schema = schema;
        this._validator = new Validator(schema, draft, shortCircuit);
        this._schemasAded = new Set<string>();
        DerefSchema.addAllRefSchemas(schema, this._validator, this._schemasAded, basePath);
    }

    static addAllRefSchemas(schema: Schema, validator: Validator, schemasAdded: Set<string>, basePath='') {
        this.findRefs(schema, schemasAdded, ref => this.addSchema(ref, schemasAdded, validator, basePath));
    }

    static findRefs(schema: Schema, schemasAdded: Set<string>, callback: (r: RefObject) => Schema | undefined) {
        if (Array.isArray(schema)) {
            schema.forEach((item) => this.findRefs(item, schemasAdded, callback));
            return;
        }
        if (typeof schema === 'object') {
            if (schema['$ref'] !== undefined) {
                const refSchema = callback(schema as RefObject);
                refSchema && this.findRefs(refSchema, schemasAdded, callback);
            }
            Object.keys(schema).forEach(key => this.findRefs(schema[key], schemasAdded, callback));
        }
    }

    static addSchema(ref: RefObject, schemasAdded: Set<string>, validator: Validator, basePath: string) : Schema | undefined {
        const refValue = ref.$ref;
        if (refValue[0] === '#') {
            return;
        }
        if (!schemasAdded.has(refValue)) {
            const filePath = basePath ? path.resolve(basePath, refValue) : refValue;
            const refSchema = JSON.parse(readFileSync(filePath, 'utf-8')) as Schema;
            schemasAdded.add(refValue);
            validator.addSchema(refSchema);
            return refSchema;
        }
    }

}