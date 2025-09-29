import { parse } from './parse';
import { readFileSync, accessSync } from 'fs';
import * as path from 'path';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
  }
}

function getPath() {
  if (process.env.ENV_CONFIG_PATH) {
    return process.env.ENV_CONFIG_PATH;
  }

  const defaultPath = path.resolve(process.cwd(), '.env');
  const alternativePath = path.resolve(process.cwd(), 'env.conf');

  // Check for .env file first
  try {
    accessSync(defaultPath);
    return defaultPath;
  } catch (e) {
    // Check for env.conf if .env doesn't exist
    try {
      accessSync(alternativePath);
      console.warn('env.conf should be renamed to .env');
      return alternativePath;
    } catch (e) {
      // If neither file exists, return default path
      return defaultPath;
    }
  }
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

// Ensure process.env[foo] gets popuplated: 3. party libraries can rely on it
const allKeys = parsed.keys();
for (const key of allKeys) {
  if (!process.env[key] && parsed.get(key)) {
    process.env[key] = parsed.get(key);
  }
}

export function get(variable: string): string;
export function get(variable: string, as: 'number'): number;
export function get(variable: string, as: 'boolean'): boolean;
export function get(variable: string, as: 'integer'): number;
export function get(variable: string, as: 'float'): number;
export function get(variable: string, as: 'date'): Date;
export function get(variable: string, as: 'json'): any;
export function get(variable: string, as = 'string'): string | number | boolean | Date | any {
  if (!variable) {
    throw new Error('Calling get with null or undefined argument');
  }

  const value = process.env[variable] || parsed.get(variable);

  if (value === undefined) {
    throw Error(
      `Configuration variable "${variable}" is not exposed as enviroment variable nor was a default provided in \`.env\``
    );
  }

  if (as === 'string') return value;
  if (as === 'boolean') return ['true', '1'].includes(value.toLowerCase());
  if (['number', 'float', 'integer'].includes(as)) return Number(value);
  if (as === 'float') return parseFloat(value);
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

export function getAllPublic(onlyParsed = false): { [key: string]: string } {
  const result: { [key: string]: string } = {};
  const keys = parsed.keys();
  for (const key of keys) {
    if (!key.startsWith('PUBLIC_')) continue;
    const value = onlyParsed ? parsed.get(key) : process.env[key] || parsed.get(key);
    result[key] = value;
  }
  return result;
}

export function has(variable: string): boolean {
  return process.env[variable] !== undefined || !!parsed.get(variable);
}

export default {
  get,
  getAll,
  getAllPublic,
  has,
};
