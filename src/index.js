import clone from 'clone'

const TYPES = ['any', 'array', 'boolean', 'function', 'integer', 'number', 'object', 'string']
const PARSERS = {
  any: v => v,
  array: v => Array.isArray(v) ? v : undefined,
  boolean: v => v != null ? (/^true$|t$|yes$|y$|1$/i.test(v) || v === true) : undefined,
  'function': v => typeof v === 'function' ? v : undefined,
  integer: v => {
    if (isNaN(parseInt(v))) return undefined
    v = parseInt(Number(v))
    if (isNaN(v)) return undefined
    return v
  },
  number: v => {
    if (isNaN(parseFloat(v))) return undefined
    v = parseFloat(Number(v))
    if (isNaN(v)) return undefined
    return v
  },
  object: v => typeof v === 'object' ? v : undefined,
  string: v => v == null ? undefined : v.toString()
}

function getKeys(object) {
  return Object.keys(object).filter(key => object.hasOwnProperty(key))
}

function pick(o, ...fields) {
  return fields.reduce((a, x) => {
    if (o.hasOwnProperty(x)) a[x] = o[x]
    return a;
  }, { })
}

export default class ModelJson {
  constructor(schema) {
    this.schema = schema

    for (const key in schema) {
      const m = schema[key]
      const { type } = m
      if (TYPES.indexOf(type) === -1) throw new Error('Type must be one of ' + TYPES)
    }
  }

  _strip(object) {
    const { schema } = this
    return pick(clone(object), ...getKeys(schema))
  }

  _coerce(object, options) {
    const { schema } = this
    const keys = getKeys(schema)
    for (const key of keys) {
      const m = schema[key], parse = PARSERS[m.type]
      const ot = typeof object[key]

      if (typeof m.preparse === 'function' && object[key] !== undefined) object[key] = m.preparse(object[key])
      object[key] = parse(object[key])
      if (typeof m.postparse === 'function' && object[key] !== undefined) object[key] = m.postparse(object[key])

      if (object[key] === undefined) {
        if (!m.required) {
          if (options.defaults && m.default !== undefined) object[key] = m.default
          else delete object[key]
        } else if (m.default !== undefined) object[key] = m.default
        else throw new Error(`Key '${key}' is of invalid type, found: '${ot}', required: '${m.type}'.`)
      }
    }
  }

  _shouldValidate(object, key, m) {
    return object.hasOwnProperty(key) && typeof m.valid === 'function'
  }

  _handleInvalid(object, key, m, options) {
    if (options.defaultOnReject && m.default !== undefined) object[key] = m.default
    else throw new Error(`Key ${key} did not pass custom valid test, '${object[key]}'.`)
  }

  _validate(object, options) {
    const { schema } = this
    const keys = getKeys(schema)
    for (const key of keys) {
      const m = schema[key]
      if (!this._shouldValidate(object, key, m)) continue
      const valid = m.valid(object[key])
      if (!valid) this._handleInvalid(object, key, m, options)
    }
  }

  async _validateAsync(object, options) {
    const { schema } = this
    const keys = getKeys(schema)
    for (const key of keys) {
      const m = schema[key]
      if (!this._shouldValidate(object, key, m)) continue
      const valid = await m.valid(object[key])
      if (!valid) this._handleInvalid(object, key, m, options)
    }
  }

  _process(object, options) {
    object = this._strip(object)
    this._coerce(object, options)
    return object
  }

  validate(object, options = { }) {
    object = this._process(object, options)
    this._validate(object, options)
    return object
  }

  async validateAsync(object, options = { }) {
    object = this._process(object, options)
    await this._validateAsync(object, options)
    return object
  }
}
