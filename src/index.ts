import { parse } from './parse';
import fs = require('fs');
import path = require('path');

const configPath = process.env.ENV_CONF_PATH || path.resolve(process.cwd(), 'env.conf');

let parsed: Map<string, string>;
let emptyKeys: [string?];

try {
  [parsed, emptyKeys] = parse(fs.readFileSync(configPath, { encoding: 'utf8' }));
} catch (e) {
  console.error(`Failed to parse env.conf (${configPath})`);
  throw e;
}

if (process.env.NODE_ENV && process.env.NODE_ENV.toUpperCase() === 'PRODUCTION') {
  const missingValues = emptyKeys.filter((key) => {
    return !(process.env[key] && process.env[key].length);
  });
  if (missingValues.length) {
    console.error(`Missing Enviroment Variables: The following variables are required (${missingValues.join(', ')})`);
  }
}

export function get(variable: string): string;
export function get(variable: string, as: 'boolean'): boolean;
export function get(variable: string, as: 'integer'): number;
export function get(variable: string, as: 'float'): number;
export function get(variable: string, as: 'date'): Date;
export function get(variable: string, as: 'json'): any;
export function get(variable: string, as = 'string'): string | number | boolean | Date | any {
  if (!variable) {
    throw new Error('Calling get with null or undefined argument');
  }

  if (!parsed.has(variable)) {
    console.warn(
      `config.get(${variable}) was not defined in the \`env.conf\`, its recommended to define all keys (leave blank if no value)`
    );
  }

  const value = process.env[variable] || parsed.get(variable);
  if (value === null) {
    console.warn(`Configuration variable "${variable}" was defined but no value was provided`);
    return null;
  }

  if (value === undefined) {
    throw Error(
      `Configuration variable "${variable}" is not exposed as enviroment variable nor was a default provided in \`env.conf\``
    );
  }

  if (as === 'string') return value;
  if (as === 'boolean') return ['true', '1'].includes(value.toLowerCase());
  if (as === 'integer') return parseInt(value, 10);
  if (as === 'float') return parseFloat(value);
  if (as === 'date') return new Date(Date.parse(value));
  if (as === 'json') return JSON.parse(value);

  throw Error(`Unknown formatting config.get(${variable}, ${as})`);
}

export function getAll() {
  const result: { [key: string]: string } = {};
  const keys = parsed.keys();
  for (const key of keys) {
    const value = process.env[key] || parsed.get(key);
    result[key] = value;
  }
  return result;
}

export function has(variable: string): boolean {
  return process.env[variable] !== undefined || !!parsed.get(variable);
}
