---
outline: deep
---
# Overview

## Introduction

1918js library contains validation utilities for:
- PESEL
- REGON
- NIP

Each of those modules exposes:
1. Simple functional API
2. Nominally-typed value-object API

## Installation

::: code-group

```sh [npm]
$ npm add 1918js
```

```sh [pnpm]
$ pnpm add 1918js
```

```sh [yarn]
$ yarn add 1918js
```

```sh [bun]
$ bun add 1918js
```

```sh [deno]
$ deno add 1918js
```

:::

## Basic usage 

#### REGON / functional api
::: info
Usage is the same for all identifiers.

Error is always returned. Never thrown.
:::

```ts [functional-example.ts]
import { validate_regon } from "1918js"

declare const some_unknown_user_input: unknown;

const result = validate_regon(some_unknown_user_input)

if(result.ok) {
  console.log("happy path :)")
  console.log("our value: ", result.value)
}

if(!result.ok) {
  console.log("you know what path this is :(")

  // error is accessed as a value, never thrown
  console.log("error name", result.error.name)
  console.log("error message", result.error.message)
}
```

#### REGON / value-object api

::: tip
Value-objects are instances of classes.

Value-objects serve as encapsulators of valid data and behaviour related to it.

Value-objects serve as runtime-safe alternative to branded types.

You can use them as function arguments.
:::

```ts [value-object-example.ts]
import { Regon } from "1918js"

declare const some_unknown_user_input: unknown;

const result = Regon.try_parse(some_unknown_user_input)

if(result.ok) {
  console.log("happy path :)")

  const regon_object = result.value
  console.log("our value: ", regon_object.as_string())
}

if(!result.ok) {
  console.log("you know what path this is :(")

  // error is accessed as a value, never thrown
  console.log("error name", result.error.name)
  console.log("error message", result.error.message)
}
```


#### Zod validator wrapper

```ts [zod-validator-example.ts]
import z from "zod"
import { validate_regon } from "1918js"

const regon_schema = z.any().superRefine((regonValue, ctx) => {
  const result = validate_regon(regonValue);

  if (!result.ok) {
    ctx.addIssue({
      code: "custom",
      messsage: "REGON is not valid",
    });
  }
});

const my_form_schema = z.object({
  regon: regon_schema,
  first_name: z.string(), // example field
  // some other fields...
})
```
