import { Validator, Schema, SchemaDraft } from '@cfworker/json-schema';
interface RefObject {
    $ref: string;
}
export declare class DerefSchema {
    private readonly _schema;
    private readonly _validator;
    private readonly _schemasAded;
    getSchemasAded(): Set<string>;
    getValidator(): Validator;
    getSchema(): Schema;
    constructor(schema: Schema, draft?: SchemaDraft, shortCircuit?: boolean, basePath?: string);
    static addAllRefSchemas(schema: Schema, validator: Validator, schemasAdded: Set<string>, basePath?: string): void;
    static findRefs(schema: object, schemasAdded: Set<string>, callback: (r: RefObject) => object | undefined): void;
    static addSchema(ref: RefObject, schemasAdded: Set<string>, validator: Validator, basePath: string): object | undefined;
}
export {};
//# sourceMappingURL=deref_schema.d.ts.map