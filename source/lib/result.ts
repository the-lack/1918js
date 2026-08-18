export interface Success<T> {
  readonly ok: true
  readonly value: T
  readonly error?: never
}

export interface Failure<E extends Error> {
  readonly ok: false
  readonly error: E
  readonly value?: never
}

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E extends Error>(error: E): Result<never, E> {
  return { ok: false, error };
}

export type Result<T, E extends Error> =
  | Failure<E>
  | Success<T>
