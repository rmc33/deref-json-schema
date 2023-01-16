import { Validator, Schema, SchemaDraft } from '@cfworker/json-schema';
import { readFileSync } from 'fs';
import path from 'path';

interface RefObject {
    $ref: string;
}

interface DerefCreateOptions {
    schema: Schema;
    draft: SchemaDraft;
    shortCircuit: boolean;
    basePath: string;
}

export class DerefSchema {

    private readonly _schema: Schema;
    private readonly _validator: Validator;
    private readonly _schemasAded: Set<string>;
    private readonly _basePath: string;

    public getSchemasAded(): Set<string> {
        return this._schemasAded;
    }
    public getValidator() {
        return this._validator;
    }
    public getSchema() {
        return this._schema;
    }
    public getBasePath() {
        return this._basePath;
    }

    constructor(schema: Schema, draft?: SchemaDraft, shortCircuit?: boolean, basePath?: string) {
        this._schema = schema;
        this._validator = new Validator(schema, draft, shortCircuit);
        this._schemasAded = new Set<string>();
        this._basePath = basePath;
    }

    static create(schema: Schema, draft?: SchemaDraft, shortCircuit?: boolean, basePath?: string) : DerefSchema {
        const derefSchema = new DerefSchema(schema,
            draft, 
            shortCircuit, 
            basePath);
        derefSchema.addAllRefSchemas();
        return derefSchema;
    }

    addAllRefSchemas() {
        DerefSchema.findRefs(this._schema as object, 
            this._schemasAded, 
            ref => DerefSchema.addSchema(ref, this._schemasAded, this._validator, this._basePath));
    }

    static findRefs(schema: object, schemasAdded: Set<string>, callback: (r: RefObject) => object | undefined) {
        if (schema['$ref'] !== undefined) {
            const refSchema = callback(schema as RefObject);
            refSchema && this.findRefs(refSchema, schemasAdded, callback);
        }
        Object.keys(schema).forEach(key => {
            if (Array.isArray(schema[key])) {
                schema[key].forEach((item) => typeof item === 'object' && this.findRefs(item, schemasAdded, callback));
                return;
            }
            typeof schema[key] === 'object' && this.findRefs(schema[key], schemasAdded, callback);
        });
    }

    static addSchema(ref: RefObject, schemasAdded: Set<string>, validator: Validator, basePath: string) : object | undefined {
        const refValue = ref.$ref;
        if (refValue[0] === '#') { // ignore internal reference
            return;
        }
        const filePath = refValue.match(/(.*)#?/); // get local file path up to # if present
        if (filePath && !schemasAdded.has(filePath[1])) {
            const fullFilePath = basePath ? path.resolve(basePath, filePath[1]) : filePath[1];
            const refSchema = JSON.parse(readFileSync(fullFilePath, 'utf-8')) as Schema;
            schemasAdded.add(filePath[1]);
            validator.addSchema(refSchema);
            return refSchema;
        }
    }

}