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

  it('should use custom schema validator and reject the default', () => {
    should.throws(() => {
      m1.validate({ })
    })
  })

  it('should use custom schema validator and reject', () => {
    should.throws(() => {
      m1.validate({ field: '' })
    })
  })

  it('should use custom schema validator and accept', () => {
    m1.validate({ field: 'foo' })
  })
})
