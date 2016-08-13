const model = require('../lib/')
const should = require('should')

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
  const bool_nr_nd = new model({
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

  const bool_nr = new model({
    field: {
      type: 'boolean',
      default: true
    }
  })
  it('should not set the default value when missing and not required', () => {
    bool_nr.validate({ }).should.deepEqual({ })
  })

  const bool_nd = new model({
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
  it('should error when the value is required async', done => {
    bool_nd.validateAsync({ }).then(() => done('Should not succeed')).catch(e => done())
  })

  const bool = new model({
    field: {
      type: 'boolean',
      required: true,
      default: true
    }
  })
  it('should set a default value when missing', () => {
    bool.validate({ }).should.deepEqual({ field: true })
  })

  const testing = new model({
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

describe('schema parsing', () => {
  const m1 = new model({
    field: {
      type: 'string',
      preparse: v => v.trim(),
      valid: v => v.length > 0
    }
  })
  const m2 = new model({
    field: {
      type: 'string',
      postparse: v => v.trim(),
      valid: v => v.length > 0
    }
  })

  it('should throw', () => {
    should.throws(() => {
      m1.validate({ field: ' ' })
    })
    should.throws(() => {
      m2.validate({ field: ' ' })
    })
  })

  it('should throw async', (done) => {
    m1.validateAsync({ field: ' ' }).then(() => done('Should not complete')).catch(() => done())
  })

  it('should throw async', (done) => {
    m2.validateAsync({ field: ' ' }).then(() => done('Should not complete')).catch(() => done())
  })

  it('should process', () => {
    m1.validate({ field: 'testing ' }).should.deepEqual({ field: 'testing' })
    m2.validate({ field: 'testing ' }).should.deepEqual({ field: 'testing' })
  })

  it('should process async', done => {
    m1.validateAsync({ field: 'testing ' }).then(obj => {
      obj.should.deepEqual({ field: 'testing' })
      done()
    }).catch(e => done(e))
  })

  it('should process async', done => {
    m2.validateAsync({ field: 'testing ' }).then(obj => {
      obj.should.deepEqual({ field: 'testing' })
      done()
    }).catch(e => done(e))
  })
})

describe('custom schema validation', () => {
  const m1 = new model({
    field: {
      type: 'string',
      required: true,
      default: '',
      valid: v => v.length > 0
    }
  })

  const m2 = new model({
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

  it('should use custom schema validator and reject the (not passing) default async', done => {
    m1.validateAsync({ }).then(obj => done('Should not complete')).catch(e => done())
  })

  it('should use custom schema validator and reject 1', () => {
    should.throws(() => {
      m1.validate({ field: '' })
    })
  })

  it('should use custom schema validator and reject 1 async', done => {
    m1.validateAsync({ field: '' }).then(obj => done('Should not complete')).catch(e => done())
  })

  it('should use custom schema validator and reject 2', () => {
    should.throws(() => {
      m2.validate({ field: '' })
    })
  })

  it('should use custom schema validator and reject 2 async', done => {
    m2.validateAsync({ field: '' }).then(obj => done('Should not complete')).catch(e => done())
  })

  it('should use custom schema validator and accept', () => {
    m1.validate({ field: 'foo' }).should.deepEqual({ field: 'foo' })
  })

  it('should use custom schema validator and accept async', done => {
    m1.validateAsync({ field: 'foo' }).then(obj => {
      obj.should.deepEqual({ field: 'foo' })
      done()
    }).catch(e => done(e))
  })

  it('should use custom schema validator and use default on reject', () => {
    m1.validate({ field: '' }, { defaultOnReject: true }).should.deepEqual({ field: '' })
  })

  it('should use custom schema validator and use default on reject async', done => {
    m1.validateAsync({ field: '' }, { defaultOnReject: true }).then(obj => {
      obj.should.deepEqual({ field: '' })
      done()
    }).catch(e => done(e))
  })

  it('should use custom schema validator and use default on reject', () => {
    m2.validate({ field: '' }, { defaultOnReject: true }).should.deepEqual({ field: '__abc123' })
  })

  it('should use custom schema validator and use default on reject async', done => {
    m2.validateAsync({ field: '' }, { defaultOnReject: true }).then(obj => {
      obj.should.deepEqual({ field: '__abc123' })
      done()
    }).catch(e => done(e))
  })

  const async_model = new model({
    field: {
      type: 'string',
      required: true,
      default: '',
      valid: v => new Promise(function(resolve, reject) {
        setTimeout(() => {
          resolve(true)
        }, 5)
      })
    }
  })

  it('should work with an async valid', done => {
    async_model.validateAsync({ field: 'test' }).then(obj => {
      obj.should.deepEqual({ field: 'test' })
      done()
    }).catch(e => done(e))
  })
})

describe('bugs', () => {
  const regression_1 = new model({
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

  it('[regression] should not run the valid check', () => {
    regression_1.validate({ id: 'test', first_name: 'Bob' }).should.deepEqual({ id: 'test', first_name: 'Bob' })
  })

  it('[regression] should not run the valid check async', done => {
    regression_1.validateAsync({ id: 'test', first_name: 'Bob' }).then(obj => {
      obj.should.deepEqual({ id: 'test', first_name: 'Bob' })
      done()
    }).catch(e => done(e))
  })

  const m3 = new model({
    field: {
      type: 'number',
      postparse: v => { throw new Error() },
      valid: v => v.length > 0
    }
  })

  it('[regression] should not post process', () => {
    m3.validate({ field: 'a' }).should.deepEqual({ })
  })

  it('[regression] should not post process async', done => {
    m3.validateAsync({ field: 'a' }).then(obj => {
      obj.should.deepEqual({ })
      done()
    }).catch(e => done(e))
  })

  const bug1_a = new model({
    number: {
      type: 'number',
      required: true
    }
  })

  const bug1_b = new model({
    integer: {
      type: 'integer',
      required: true
    }
  })

  it('[issue #1] bug: Number type is not strict', () => {
    should.throws(() => {
      bug1_a.validate({ number: '1.2a' })
    })
    should.throws(() => {
      bug1_b.validate({ integer: '5.2a' })
    })
  })
})
