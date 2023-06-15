const path = require('path');

const assert = require('assert');
const { it, describe } = require('node:test');

process.env.ENV_CONFIG_PATH = path.join(__dirname, '../../fixtures/.env');

console.log(process.env.ENV_CONFIG_PATH);
const { getAll, get, has, getAllPublic } = require('../../lib/index');

describe('getAll', () => {
  it('confirm that all keys are returned', () => {
    const all = getAll();
    assert.equal(Object.keys(all).length, 19);
    assert.equal(all.EMPTY, null);
  });
});

describe('getAllPublic', () => {
  it('confirm that all safe keys are returned', () => {
    const all = getAllPublic();
    assert.equal(Object.keys(all).length, 1);
    assert.equal(all.PUBLIC_APP_NAME_NOT_IMPORTANT, 'Bedrock Config');
  });
});

describe('get', () => {
  it('get value', () => {
    assert.equal(get('BASIC'), 'basic');
    assert.equal(get('NUMBER'), '1');
  });

  it('get empty', () => {
    assert.equal(get('EMPTY'), null);
  });

  it('get empty with quotes', () => {
    assert.equal(get('EMPTY_WITH_QUOTES'), null);
  });

  it('not defined key', () => {
    assert.throws(() => get('BAD_VALUE'), {
      message:
        'Configuration variable "BAD_VALUE" is not exposed as enviroment variable nor was a default provided in `.env`',
    });
  });

  it('get value as number', () => {
    assert.equal(get('NUMBER', 'integer'), 1);
  });

  it('get value as float', () => {
    assert.equal(get('NUMBER', 'float'), 1);
  });

  it('get value as boolean', () => {
    assert.equal(get('NUMBER', 'boolean'), true);
  });

  it('get value as date', () => {
    assert.equal(get('DATE', 'date').valueOf(), 1548794502645);
  });

  it('get value as json', () => {
    assert.deepEqual(get('RETAIN_INNER_QUOTES', 'json'), {
      foo: 'bar',
    });
  });
});

describe('has', () => {
  it('with value', () => {
    assert.equal(has('BASIC'), true);
  });

  it('without value', () => {
    assert.equal(has('EMPTY'), false);
  });

  it('not defined key', () => {
    assert.equal(has('BAD_VALUE'), false);
  });
});
