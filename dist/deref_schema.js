import { Validator } from '@cfworker/json-schema';
import fs from 'fs';
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
        if (schema?.$ref) {
            const refSchema = callback(schema);
            callback({});
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
        const refValue = ref?.$ref;
        const hashIndex = refValue?.indexOf('#');
        if (hashIndex === 0) { // ignore internal reference
            return;
        }
        const filePath = hashIndex === -1 ? refValue : refValue.substring(0, hashIndex); // get local file path up to # or end of the string
        if (filePath && !schemasAdded.has(filePath)) {
            const fullFilePath = basePath ? path.resolve(basePath, filePath) : filePath;
            const refSchema = JSON.parse(fs.readFileSync(fullFilePath, 'utf-8'));
            schemasAdded.add(filePath);
            validator.addSchema(refSchema);
            return refSchema;
        }
    }
}
