/**
 * Setup global para testes — registra polyfills antes de qualquer teste.
 */
import { indexedDB, IDBKeyRange } from "fake-indexeddb";

// Polyfill indexedDB para jsdom
if (typeof globalThis.indexedDB === "undefined") {
  Object.defineProperty(globalThis, "indexedDB", {
    value: indexedDB,
    writable: true,
    configurable: true,
  });
}
if (typeof globalThis.IDBKeyRange === "undefined") {
  Object.defineProperty(globalThis, "IDBKeyRange", {
    value: IDBKeyRange,
    writable: true,
    configurable: true,
  });
}
