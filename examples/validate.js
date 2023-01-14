import { Validator } from '@cfworker/json-schema';
import { createRequire } from "module";
import { DerefSchema, DerefValidator } from '../dist/index.js';

const require = createRequire(import.meta.url);
const feedSchema = require('./feed.schema.json');

const shortCircuit = false;
const draft = '2020-12';

const validator = new DerefValidator(feedSchema);

const result = validator.getValidator().validate({
    data: [
        { id: "1", price: { units: 100 }, time: { seconds: 100 } },
        { id: "1", price: { units: 100, currency: 'USD' }, time: { seconds: 200 } }
    ]
});

console.log(JSON.stringify(feedSchema));

console.log('result = ', getErrors(result));

const feedItemValidator = new DerefValidator(
    { $ref: '#/definitions/feed_item', definitions: feedSchema.definitions },
    draft,
    shortCircuit);

const feedItemResult = feedItemValidator.getValidator().validate(
    { id: "1", price: { units: 100 }, time: { seconds: 100 } },
);
console.log('feedItem result = ', getErrors(feedItemResult));

function getErrors(result) {
    return result.errors && result.errors.filter((item) => {
        return !["$ref", "items", "properties"].includes(item.keyword);
    }).map((item)=> {
        return `instanceLocation:${item.instanceLocation}, error: ${item.error}`;
    });
}