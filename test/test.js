var model = require('../lib/')
var should = require('should')

describe('schema creation', () => {
  it('should throw without a type', () => {
    should.throws(() => {
      new model({ it: { } })
    })
  })

  it('should throw with an invalid type', () => {
    should.throws(() => {
      new model({ it: { type: 'foo' } })
    })
  })

  it('should pass with valid types', () => {
    new model({ it: { type: 'boolean' } })
  })
})

describe('schema validation', () => {
  var bool_nr_nd = new model({
    field: {
      type: 'boolean'
    }
  })
  it('should remove fields which do not belong', () => {
    bool_nr_nd.validate({ foo: 'bar' }).should.deepEqual({ })
  })
  it('should coerce value to boolean (false)', () => {
    bool_nr_nd.validate({ foo: 'bar', field: 'apple' }).should.deepEqual({ field: false })
    bool_nr_nd.validate({ foo: 'bar', field: '0' }).should.deepEqual({ field: false })
    bool_nr_nd.validate({ foo: 'bar', field: 'false' }).should.deepEqual({ field: false })
    bool_nr_nd.validate({ foo: 'bar', field: 'yas' }).should.deepEqual({ field: false })
    bool_nr_nd.validate({ foo: 'bar', field: 'truu' }).should.deepEqual({ field: false })
  })
  it('should coerce value to boolean (true)', () => {
    bool_nr_nd.validate({ foo: 'bar', field: 'true' }).should.deepEqual({ field: true })
    bool_nr_nd.validate({ foo: 'bar', field: 't' }).should.deepEqual({ field: true })
    bool_nr_nd.validate({ foo: 'bar', field: 'yes' }).should.deepEqual({ field: true })
    bool_nr_nd.validate({ foo: 'bar', field: 'y' }).should.deepEqual({ field: true })
    bool_nr_nd.validate({ foo: 'bar', field: '1' }).should.deepEqual({ field: true })
  })

  var bool_nr = new model({
    field: {
      type: 'boolean',
      default: true
    }
  })
  it('should not set the default value when missing and not required', () => {
    bool_nr.validate({ }).should.deepEqual({ })
  })

  var bool_nd = new model({
    field: {
      type: 'boolean',
      required: true
    }
  })
  it('should error when the value is required', () => {
    should.throws(() => {
      bool_nd.validate({ })
    })
  })

  var bool = new model({
    field: {
      type: 'boolean',
      required: true,
      default: true
    }
  })
  it('should set a default value when missing', () => {
    bool.validate({ }).should.deepEqual({ field: true })
  })

  var testing = new model({
    field1: {
      type: 'boolean',
      default: true
    },
    field2: {
      type: 'boolean',
      default: false
    },
    field3: {
      type: 'string',
      default: 'noob'
    },
    field4: {
      type: 'string',
      default: 'noob'
    },
    field5: {
      type: 'boolean'
    },
    field6: {
      type: 'string'
    }
  })
  it('should set all defaults when optioned to do so', () => {
    testing.validate({ field4: 5 }, { defaults: true }).should.deepEqual({ field1: true, field2: false, field3: 'noob', field4: '5' })
  })
})

describe('custom schema validation', () => {
  var m1 = new model({
    field: {
      type: 'string',
      required: true,
      default: '',
      valid: v => v.length > 0
    }
  })

  var m2 = new model({
    field: {
      type: 'string',
      required: true,
      default: '__abc123',
      valid: v => v.length > 0
    }
  })

  it('should use custom schema validator and reject the (not passing) default', () => {
    should.throws(() => {
      m1.validate({ })
    })
  })

  it('should use custom schema validator and reject 1', () => {
    should.throws(() => {
      m1.validate({ field: '' })
    })
  })

  it('should use custom schema validator and reject 2', () => {
    should.throws(() => {
      m2.validate({ field: '' })
    })
  })

  it('should use custom schema validator and accept', () => {
    m1.validate({ field: 'foo' }).should.deepEqual({ field: 'foo' })
  })

  it('should use custom schema validator and use default on reject', () => {
    m1.validate({ field: '' }, { defaultOnReject: true }).should.deepEqual({ field: '' })
  })

  it('should use custom schema validator and use default on reject', () => {
    m2.validate({ field: '' }, { defaultOnReject: true }).should.deepEqual({ field: '__abc123' })
  })

  it('[regression] should not run the valid check', () => {
    var regression_1 = new model({
      id: {
        type: 'string',
        required: true
      }, first_name: {
        type: 'string',
        default: 'unknown',
        valid: v => v.length > 0
      }, last_name: {
        type: 'string',
        default: 'unknown',
        valid: v => v.length > 0
      }
    })
    regression_1.validate({ id: 'test', first_name: 'Bob' }).should.deepEqual({ id: 'test', first_name: 'Bob' })
  })
})
