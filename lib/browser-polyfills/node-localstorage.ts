// Browser polyfill for node-localstorage
// Uses browser's localStorage instead of file system

export class LocalStorage {
  private prefix: string;

  constructor(path?: string) {
    // Use the path as a prefix for keys to simulate separate storage areas
    this.prefix = path ? `${path}:` : "";
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(this.getKey(key));
  }

  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(this.getKey(key), value);
  }

  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    if (typeof window === "undefined") return;
    // Only clear keys with our prefix
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  }

  key(index: number): string | null {
    if (typeof window === "undefined") return null;
    // This is approximate since we can't easily filter by prefix
    return window.localStorage.key(index);
  }

  get length(): number {
    if (typeof window === "undefined") return 0;
    // Approximate count
    let count = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        count++;
      }
    }
    return count;
  }
}

export default LocalStorage;
