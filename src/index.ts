const { parse } = require('./parse');
const { readFileSync, accessSync } = require('fs');
const path = require('path');

function getPath() {
  if (process.env.ENV_CONFIG_PATH) {
    return process.env.ENV_CONFIG_PATH;
  }

  const defaultPath = path.resolve(process.cwd(), '.env');

  try {
    if (accessSync(defaultPath)) return defaultPath;
  } catch (e) {}

  const alternativePath = path.resolve(process.cwd(), 'env.conf');

  try {
    if (accessSync(alternativePath)) {
      console.warn('env.conf should be renamed to .env');
      return alternativePath;
    }
  } catch (e) {}

  return defaultPath;
}

let parsed: Map<string, string>;
let emptyKeys: [string?];

const configPath = getPath();

try {
  [parsed, emptyKeys] = parse(readFileSync(configPath, { encoding: 'utf8' }));
} catch (e) {
  console.error(`Failed to parse .env (${configPath})`);
  throw e;
}

export function get(variable: string): string;
export function get(variable: string, as: 'boolean'): boolean;
export function get(variable: string, as: 'number'): number;
export function get(variable: string, as: 'date'): Date;
export function get(variable: string, as: 'json');
export function get(
  variable: string,
  as?: 'boolean' | 'number' | 'date' | 'json' | 'string'
): string | number | boolean | Date | any {
  if (!variable) {
    throw new Error('Calling get with null or undefined argument');
  }

  const value = process.env[variable] || parsed.get(variable);
  if (value === undefined) {
    throw Error(
      `Configuration variable "${variable}" is not exposed as enviroment variable nor was a default provided in \`.env\``
    );
  }

  if (as === 'string' || !as) return value;
  if (as === 'boolean') return ['true', '1'].includes(value.toLowerCase());
  if (as === 'number') return Number(value);
  if (as === 'date') return new Date(Date.parse(value));
  if (as === 'json') return JSON.parse(value);

  throw Error(`Unknown formatting config.get(${variable}, ${as})`);
}

export function getAll(onlyParsed = false): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  const keys = parsed.keys();
  for (const key of keys) {
    const value = onlyParsed ? parsed.get(key) : process.env[key] || parsed.get(key);
    result[key] = value;
  }
  return result;
}

export function has(variable: string): boolean {
  return process.env[variable] !== undefined || !!parsed.get(variable);
}
