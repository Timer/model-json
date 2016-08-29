# model-json
`model-json` is a library which enforces a schema on a JSON object.

When the schema is applied to an object, coercion is applied where applicable and keys which do not belong are stripped.
Keys which are within the schema are validated and are either removed, set to defaults, or rejected per configuration.

See usage examples to get started with the library.

### Install
```
$ npm i model-json -S
```

### Usage
Example of type coercion and field stripping:
```js
import model from 'model_json'
const example = new model({
  fieldA: {
    type: 'string'
  },
  fieldB: {
    type: 'number'
  }
})

console.log(example.validate({
  fieldA: 5,
  fieldB: '15',
  fieldC: 'this should be gone'
})) // -> { fieldA: '5', fieldB: 15 }
console.log(example.validate({
  fieldA: 5,
  fieldB: 'Since this field is not required and is not a number, it will be removed from the object.'
})) // -> { fieldA: '5' }
```

Example of defaults:
```js
import model from 'model_json'
const example = new model({
  fieldA: {
    type: 'string',
    required: true,
    default: 'No string provided'
  },
  fieldB: {
    type: 'string',
    default: `This default will not appear by default because the field is not required. This behavior is configurable via an option, as shown.`
  }
})

console.log(example.validate({ })) // -> { fieldA: 'No string provided' }
console.log(example.validate({ }, { defaults: true })) // -> { fieldA: 'No string provided', fieldB: 'This default <clip> ...' }
```

```js
import model from 'model_json'
const example = new model({
  fieldA: {
    type: 'number',
    required: true,
    default: 1337
  }
})

console.log(example.validate({ })) // -> { fieldA: 1337 }
console.log(example.validate({ fieldA: 3 })) // -> { fieldA: 3 }
console.log(example.validate({ fieldA: '3' })) // -> { fieldA: 3 }
console.log(example.validate({ fieldA: 'apple' })) // -> { fieldA: 1337 }
```

Example of validation:
```js
import model from 'model_json'
const exampleA = new model({
  field: {
    type: 'string',
    valid: str => str.length > 0
  }
})

console.log(exampleA.validate({ field: '' })) // Error: Key field did not pass custom valid test, ''.
console.log(exampleA.validate({ field: 'Test' })) // -> { field: 'Test' }

// Valid is applied *after* default is set
// Usage of default on rejection may be forced with a flag as shown
const exampleB = new model({
  field: {
    type: 'string',
    required: true,
    default: '',
    valid: str => str.length > 0
  }
})

console.log(exampleB.validate({ })) // Error: Key field did not pass custom valid test, ''.
console.log(exampleB.validate({ }, { defaultOnReject: true })) // -> { field: '' }
```

### Documentation
#### Types
Type | Coercion | Explanation
--- | --- | ---
`any` | No | No value is disregarded
`array` | No | Values which do not return true from `Array.isArray` are disregarded
`boolean` | Yes | `null` is disregarded; `true`, `'true'`, `'t'`, `'yes'`, `'y'`, `1`, and `'1'` are considered `true` -- all other values `false`
`function` | No | Type of field must be `function`, otherwise disregarded
`integer` | Yes | Disregards values which are `NaN` when parsed; does not allow alphabetic characters while parsing; removes any precision (`15.2` -> `15`)
`number` | Yes | Disregards values which are `NaN` when parsed; does not allow alphabetic characters while parsing
`object` | No | Type of field must be `object`, otherwise disregarded
`string` | Yes | Disregards `null`; all other values are coerced to a string via `.toString()`
