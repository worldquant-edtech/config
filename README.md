# @wqlearning/config

## Install

```bash
npm install @wqlearning/config
```

## Usage

Create a `.env` file in the root directory of your project. Add
environment-specific variables on new lines in the form of `NAME=VALUE`.
For example:

```ini
DB_HOST=localhost
DB_PORT=2000
SENTRY_API=
START_DATE=2019-01-30T10:00:48.185Z
```

```javascript
const config = require('@wqlearning/config');
db.connect({
  host: config.get('DB_HOST'),
  port: config.get('DB_PORT', 'number'),
});

// check if START_DATE is bigger than current time and SENTRY_API has value
if (config.get('START_DATE', 'date') < Date.now() && config.has('SENTRY_API')) {
  sentry.init({
    dsn: config.get('SENTRY_API'),
  });
}
```

### Methods

#### get

Default: `config.get('DB_HOST', "string"): string`

Return the value of the variable or throws an error if the variable is not defined in the .env or available via `process.env`.

```
config.get(
  variable,
  as?: "string" | "boolean" | "json" | "number" | "date"
): string | number | boolean | Date | any
```

#### has

Default: `config.has('DB_HOST'): boolean`

Returns true if the variable got value

#### getAll

Default: `config.getAll(onlyParsed=false): {[key: string]: string}`

Return all defined keys and values as a key value object (from process.env and .env merged), or only from .env if onlyParsed is set to true.

#### getAllPublic

Default: `config.getAllPublic(onlyParsed=false): {[key: string]: string}`

Return all defined public (envs. vars that the prefix `PUBLIC_`) keys and values as a key value object (from process.env and .env merged), or only from .env if onlyParsed is set to true.

#### Environment variable ENV_CONFIG_PATH

This variable allows you set a different location for your .env file.
