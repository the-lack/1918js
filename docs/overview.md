---
outline: deep
---
# Overview

## Introduction

1918js library contains validation utilities for:
- PESEL
- REGON
- NIP

Each of those modules exposes a simple functional API.

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

::: warning
Never store polish identifiers as numbers.

This causes issues with leading zeros.
:::


#### REGON example
::: info
Usage is the same for all identifiers.

Error is always returned. Never thrown.
:::

```ts [validate-user-input-example.ts]
import { validateRegon } from "1918js"

declare const someUnknownUserInput: unknown;

const result = validateRegon(someUnknownUserInput)

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

## Advanced usage

#### Zod validator wrapper

```ts [zod-validator-example.ts]
import z from "zod"
import { validateRegon } from "1918js"

const regonSchema = z.any().superRefine((regonValue, ctx) => {
  const result = validateRegon(regonValue);

  if (!result.ok) {
    ctx.addIssue({
      code: "custom",
      messsage: "REGON is not valid",
    });
  }
});

const myFormSchema = z.object({
  regon: regonSchema,
  // some other fields...
})
```

#### Value object wrapper

You can also create your custom value-object wrapper.

```ts [value-object-wrapper-example.ts]
import { validateRegon } from "1918js"

class Regon {
  #value: string;

  private constructor(regon: string) {
    this.#value = regon;
  }

  static tryParse(regonCandidate: unknown) {
    const result = validateRegon(regonCandidate)

    if (!result.ok) return result;

    return ok(new Regon(result.value))
  }

  asString(): string {
    return this.#value;
  }

  equals(other: unknown): other is Regon {
    if (!(other instanceof Regon)) return false;

    return this.#value === other.#value;
  }
}
```
