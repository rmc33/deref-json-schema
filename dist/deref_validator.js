import { Validator } from '@cfworker/json-schema';
import { DerefSchema } from './deref_schema.js';
export class DerefValidator {
    get schemasAded() {
        return this._schemasAded;
    }
    getValidator() {
        return this._validator;
    }
    getSchema() {
        return this._schema;
    }
    constructor(schema, draft, shortCircuit, basePath = '') {
        this._schema = schema;
        this._validator = new Validator(schema, draft, shortCircuit);
        this._schemasAded = new Set();
        DerefSchema.addAllRefSchemas(schema, this._validator, this._schemasAded, basePath);
    }
}
