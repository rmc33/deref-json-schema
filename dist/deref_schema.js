import { readFileSync } from 'fs';
import path from 'path';
export class DerefSchema {
    static addAllRefSchemas(schema, validator, schemasAdded, basePath = '') {
        this.findRefs(schema, schemasAdded, ref => this.addSchema(ref, schemasAdded, validator, basePath));
    }
    static findRefs(schema, schemasAdded, callback) {
        if (Array.isArray(schema)) {
            schema.forEach((item) => this.findRefs(item, schemasAdded, callback));
            return;
        }
        if (typeof schema === 'object') {
            if (schema['$ref'] !== undefined) {
                const refSchema = callback(schema);
                refSchema && this.findRefs(refSchema, schemasAdded, callback);
            }
            Object.keys(schema).forEach(key => this.findRefs(schema[key], schemasAdded, callback));
        }
    }
    static addSchema(ref, schemasAdded, validator, basePath) {
        const refValue = ref.$ref;
        if (refValue[0] === '#') {
            return;
        }
        if (!schemasAdded.has(refValue)) {
            const filePath = basePath ? path.resolve(basePath, refValue) : refValue;
            const refSchema = JSON.parse(readFileSync(filePath, 'utf-8'));
            schemasAdded.add(refValue);
            validator.addSchema(refSchema);
            return refSchema;
        }
    }
}
