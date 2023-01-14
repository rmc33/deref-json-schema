# deref-json-schema

Uses `@cfworker/json-schema` to recursively call [Validator](https://github.com/cfworker/cfworker/blob/main/packages/json-schema/src/validator.ts).`addSchema` for all `$ref` schemas.


# Basic usage

1. Start with a base schema file `feed.schema.json` that references a subschema file `feed_item.schema.json`
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
2. Initalialize `DerefValidator` with base schema
```
const feedSchema = require('./feed.schema.json');
const validator = new DerefValidator(feedSchema);
```

Creating a `DerefValidator` will search `feedSchema`, find `$ref` with value `feed_item.schema.json` and call [Validator](https://github.com/cfworker/cfworker/blob/main/packages/json-schema/src/validator.ts).`addSchema` with the JSON object from the file. This will be done recusively for all `$ref` schemas; schema files already added will not be added again. A `basePath` can be optionally supplied to `addAllRefSchemas` to resolve `$ref` value file paths relative to the `basePath`.

3. Validate using schema
```
const result = validator.getValidator().validate({
    data: [
        { id: "1", price: { units: 100 }, time: { seconds: 100 } },
        { id: "1", price: { units: 100, currency: 'USD' }, time: { seconds: 200 } }
    ]
});
```




