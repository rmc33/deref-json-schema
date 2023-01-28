import { Validator, Schema, SchemaDraft } from '@cfworker/json-schema';
interface RefObject {
    $ref?: string;
}
export declare class DerefSchema {
    private readonly _schema;
    private readonly _validator;
    private readonly _schemasAded;
    private readonly _basePath;
    getSchemasAded(): Set<string>;
    getValidator(): Validator;
    getSchema(): Schema;
    getBasePath(): string;
    constructor(schema: Schema, draft?: SchemaDraft, shortCircuit?: boolean, basePath?: string);
    static create(schema: Schema, draft?: SchemaDraft, shortCircuit?: boolean, basePath?: string): DerefSchema;
    addAllRefSchemas(): void;
    static findRefs(schema: RefObject, schemasAdded: Set<string>, callback: (r: RefObject) => Schema | undefined): void;
    static addSchema(ref: RefObject, schemasAdded: Set<string>, validator: Validator, basePath: string): Schema | undefined;
}
export {};
//# sourceMappingURL=deref_schema.d.ts.map