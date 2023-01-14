# deref-json-schema

Works with `@cfworker/json-schema` to recursively call [Validator](https://github.com/cfworker/cfworker/blob/main/packages/json-schema/src/validator.ts).`addSchema` for all `$ref` schemas.


# Basic usage

1. Start with a base schema
```
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/feed.schema.json",
  "title": "Feed schema",
  "description": "A feed",
  "type": "object",
  "properties": {
    "data": {
      "description": "The feed data",
      "type": "array",
      "items": {
        "$ref": "feed_item.schema.json"
      }
    }
  }
}
```
2. Initalialize [Validator](https://github.com/cfworker/cfworker/blob/main/packages/json-schema/src/validator.ts) with base schema
```
const feedSchema = require('./feed.schema.json');
const validator = new Validator(feedSchema);
```
3. Recursively find all `$ref` schemas and add to validator
```
DerefSchema.addAllRefSchemas(feedSchema, validator);
```
This will read `feed_item.schema.json` and invoke validator.`addSchema` with the file contents. Then the function will look for all `$ref` schemas in `feed_item.schema.json`. A `basePath` can be optinally supplied to `addAllRefSchemas` to reslove `$ref` value file paths relative to the `basePath`.





