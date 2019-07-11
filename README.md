# @kaareal/config

[![CircleCI](https://circleci.com/gh/kaareal/config/tree/master.svg?style=svg)](https://circleci.com/gh/kaareal/config/tree/master)

## Install

```bash
# with npm
npm install @kaareal/config

# or with Yarn
yarn add @kaareal/config
```

## Usage

Create a `env.conf` file in the root directory of your project. Add
environment-specific variables on new lines in the form of `NAME=VALUE`.
For example:

```dosini
DB_HOST=localhost
DB_PORT=2000
SENTRY_API=
START_DATE=2019-01-30T10:00:48.185Z
```

Its recommended to define all variables in the env.conf file, even if empty.

```javascript
const config = require('@kaareal/config');
db.connect({
  host: config.get('DB_HOST'),
  port: config.get('DB_PORT', 'integer')
});

// check if START_DATE is bigger than current time and SENTRY_API has value
if (config.get('START_DATE', 'date') < Date.now() && config.has('SENTRY_API')) {
  sentry.init({
    dsn: config.get('SENTRY_API')
  });
}
```

### Methods

#### GET

Default: `config.get('DB_HOST', "string"): string`

Return the value of the variable or warn if the variable is not defined in the env.conf or available via `process.env`.

`config.get(variable, as = "string" | "boolean" | "json" | "integer" | "float" | "date"): string | number | boolean | Date | any`

#### HAS

Default: `config.has('DB_HOST'): boolean`

Returns true if the variable got value

#### getAll

Default: `config.getAll(): {[key: string]: string}`

Return all defined (both from process.env and env.conf merged) keys and values as a key value object

#### Environment variable ENV_CONF_PATH

This variable allows you set a different location for your env.conf file.
