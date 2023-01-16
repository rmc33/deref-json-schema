import { Validator } from '@cfworker/json-schema';
import { readFileSync } from 'fs';
import path from 'path';
export class DerefSchema {
    getSchemasAded() {
        return this._schemasAded;
    }
    getValidator() {
        return this._validator;
    }
    getSchema() {
        return this._schema;
    }
    getBasePath() {
        return this._basePath;
    }
    constructor(schema, draft, shortCircuit, basePath) {
        this._schema = schema;
        this._validator = new Validator(schema, draft, shortCircuit);
        this._schemasAded = new Set();
        this._basePath = basePath;
    }
    static create(schema, draft, shortCircuit, basePath) {
        const derefSchema = new DerefSchema(schema, draft, shortCircuit, basePath);
        derefSchema.addAllRefSchemas();
        return derefSchema;
    }
    addAllRefSchemas() {
        DerefSchema.findRefs(this._schema, this._schemasAded, ref => DerefSchema.addSchema(ref, this._schemasAded, this._validator, this._basePath));
    }
    static findRefs(schema, schemasAdded, callback) {
        if (schema['$ref'] !== undefined) {
            const refSchema = callback(schema);
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
    static addSchema(ref, schemasAdded, validator, basePath) {
        const refValue = ref.$ref;
        if (refValue[0] === '#') { // ignore internal reference
            return;
        }
        const filePath = refValue.match(/(.*)#?/); // get local file path up to # if present
        if (filePath && !schemasAdded.has(filePath[1])) {
            const fullFilePath = basePath ? path.resolve(basePath, filePath[1]) : filePath[1];
            const refSchema = JSON.parse(readFileSync(fullFilePath, 'utf-8'));
            schemasAdded.add(filePath[1]);
            validator.addSchema(refSchema);
            return refSchema;
        }
    }
}
