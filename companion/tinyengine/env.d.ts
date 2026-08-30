// Minimal type shims for the node: modules tinyengine uses, so the companion type-checks
// with a bare `tsc` and zero npm dependencies. If you install @types/node, you can delete this file.
declare module "node:crypto" {
  export interface Hash {
    update(data: string | Uint8Array): Hash;
    digest(encoding: "hex"): string;
  }
  export function createHash(algorithm: string): Hash;
}
declare module "node:assert/strict" {
  export function ok(value: unknown, message?: string): asserts value;
  export function equal(actual: unknown, expected: unknown, message?: string): void;
  export function notEqual(actual: unknown, expected: unknown, message?: string): void;
  export function deepEqual(actual: unknown, expected: unknown, message?: string): void;
  export function throws(block: () => unknown, error?: RegExp | ((err: unknown) => boolean)): void;
}
declare module "node:fs" {
  export function appendFileSync(path: string, data: string, encoding: "utf-8"): void;
  export function existsSync(path: string): boolean;
  export function mkdtempSync(prefix: string): string;
  export function readFileSync(path: string, encoding: "utf-8"): string;
  export function rmSync(path: string, options?: { recursive?: boolean; force?: boolean }): void;
  export function writeFileSync(path: string, data: string): void;
}
declare module "node:os" {
  export function tmpdir(): string;
}
declare module "node:path" {
  export function join(...paths: string[]): string;
}
declare module "node:test" {
  export default function test(name: string, fn: () => void | Promise<void>): void;
}
declare module "node:process" {
  export const argv: string[];
  export function exit(code?: number): never;
}
