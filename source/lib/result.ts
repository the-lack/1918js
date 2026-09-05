export interface Success<T> {
  readonly ok: true
  readonly value: T
  readonly error?: never
}

export interface Failure<E> {
  readonly ok: false
  readonly error: E
  readonly value?: never
}

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: Readonly<E>): Result<never, E> {
  return { ok: false, error } as const;
}

export type Result<T, E> =
  | Failure<E>
  | Success<T>
