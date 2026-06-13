// cute: tiny helper !

export function toJsonSafe<T>(value: T): any {
  return JSON.parse(JSON.stringify(value));
}
