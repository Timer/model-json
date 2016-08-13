import clone from 'clone'

const TYPES = ['array', 'boolean', 'function', 'integer', 'number', 'object', 'string']
const PARSERS = {
  array: v => Array.isArray(v) ? v : undefined,
  boolean: v => v != null ? (/^true$|t$|yes$|y$|1$/i.test(v) || v === true) : undefined,
  'function': v => typeof v === 'function' ? v : undefined,
  integer: v => {
    v = parseInt(Number(v))
    if (isNaN(v)) return undefined
    return v
  },
  number: v => {
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

  validate(object, options = { }) {
    const { schema } = this

    const keys = getKeys(schema)
    object = pick(clone(object), ...keys)
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

      if (object.hasOwnProperty(key) && typeof m.valid === 'function' && !m.valid(object[key])) {
        if (options.defaultOnReject && m.default !== undefined) object[key] = m.default
        else throw new Error(`Key ${key} did not pass custom valid test, '${object[key]}'.`)
      }
    }
    return object
  }
}
