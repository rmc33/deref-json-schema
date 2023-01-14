import { Validator, Schema, SchemaDraft } from '@cfworker/json-schema';
import { DerefSchema } from './deref_schema.js';


export class DerefValidator {
    private readonly _schema;
    private readonly _validator;
    private readonly _schemasAded: Set<string>;
    public get schemasAded(): Set<string> {
        return this._schemasAded;
    }
    public getValidator() {
        return this._validator;
    }
    public getSchema() {
        return this._schema;
    }
    constructor(schema: Schema | boolean, draft?: SchemaDraft, shortCircuit?: boolean, basePath='') {
        this._schema = schema;
        this._validator = new Validator(schema, draft, shortCircuit);
        this._schemasAded = new Set<string>();
        DerefSchema.addAllRefSchemas(schema as object, this._validator, this._schemasAded, basePath);
    }
}