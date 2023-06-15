const { parse } = require('../../lib/parse');
const fs = require('fs');
const path = require('path');

const assert = require('assert');
const { it, describe } = require('node:test');

const [parsed, emptyKeys] = parse(fs.readFileSync(path.join(__dirname, '../../fixtures/.env'), { encoding: 'utf8' }));

describe('parse', () => {
  it('sets basic environment variable', () => {
    assert.equal(parsed.get('BASIC'), 'basic');
  });

  it('reads after a skipped line', () => {
    assert.equal(parsed.get('AFTER_LINE'), 'after_line');
  });

  it('defaults empty values to undefined', () => {
    assert.equal(parsed.get('EMPTY'), null);
  });

  it('escapes double quoted values', () => {
    assert.equal(parsed.get('DOUBLE_QUOTES'), 'double_quotes');
  });

  it('escapes single quoted values', () => {
    assert.equal(parsed.get('SINGLE_QUOTES'), 'single_quotes');
  });

  it('expands newlines but only if double quoted', () => {
    assert.equal(parsed.get('EXPAND_NEWLINES'), 'expand\nnewlines');
    assert.equal(parsed.get('DONT_EXPAND_NEWLINES_1'), 'dontexpand\\nnewlines');
    assert.equal(parsed.get('DONT_EXPAND_NEWLINES_2'), 'dontexpand\\nnewlines');
  });

  it('ignores commented lines', () => {
    assert.equal(parsed.get('COMMENTS'), undefined);
  });

  it('respects equals signs in values', () => {
    assert.equal(parsed.get('EQUAL_SIGNS'), 'equals==');
  });

  it('retains inner quotes', () => {
    assert.equal(parsed.get('RETAIN_INNER_QUOTES'), '{"foo": "bar"}');
    assert.equal(parsed.get('RETAIN_INNER_QUOTES_AS_STRING'), '{"foo": "bar"}');
  });

  it('retains spaces in string', () => {
    assert.equal(parsed.get('INCLUDE_SPACE'), 'some spaced out string');
  });

  it('parses email addresses completely', () => {
    assert.equal(parsed.get('USERNAME'), 'something@burger.monster');
  });

  it('should mark EMPTY as an empty key', () => {
    assert.deepEqual(emptyKeys, ['EMPTY', 'EMPTY_WITH_QUOTES']);
  });
});
