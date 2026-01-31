// Browser polyfill for Node.js path module
// Handles the case where paths might be undefined

function normalizeArray(parts: string[], allowAboveRoot: boolean): string[] {
  const res: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p || p === '.') continue;
    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop();
      } else if (allowAboveRoot) {
        res.push('..');
      }
    } else {
      res.push(p);
    }
  }
  return res;
}

function join(...paths: (string | undefined)[]): string {
  // Filter out undefined/null values and convert to strings
  const validPaths = paths
    .filter((p): p is string => p !== undefined && p !== null)
    .map(p => String(p));

  if (validPaths.length === 0) return '.';

  const joined = validPaths.join('/');
  return normalize(joined);
}

function normalize(path: string): string {
  if (!path || typeof path !== 'string') return '.';

  const isAbsolute = path.startsWith('/');
  const trailingSlash = path.endsWith('/');

  const segments = path.split('/').filter(s => s.length > 0);
  const normalized = normalizeArray(segments, !isAbsolute);

  let result = normalized.join('/');
  if (!result && !isAbsolute) result = '.';
  if (isAbsolute) result = '/' + result;
  if (trailingSlash && result !== '/') result += '/';

  return result || '.';
}

function resolve(...paths: (string | undefined)[]): string {
  let resolvedPath = '';
  let isAbsolute = false;

  for (let i = paths.length - 1; i >= -1 && !isAbsolute; i--) {
    const path = i >= 0 ? paths[i] : '/';
    if (!path) continue;

    resolvedPath = String(path) + '/' + resolvedPath;
    isAbsolute = String(path).startsWith('/');
  }

  resolvedPath = normalizeArray(
    resolvedPath.split('/').filter(s => s.length > 0),
    !isAbsolute
  ).join('/');

  return (isAbsolute ? '/' : '') + resolvedPath || '.';
}

function dirname(path: string): string {
  if (!path || typeof path !== 'string') return '.';

  const segments = path.split('/').filter(s => s.length > 0);
  if (segments.length === 0) return '.';
  segments.pop();

  const result = segments.join('/');
  if (path.startsWith('/')) {
    return '/' + result;
  }
  return result || '.';
}

function basename(path: string, ext?: string): string {
  if (!path || typeof path !== 'string') return '';

  const segments = path.split('/').filter(s => s.length > 0);
  let result = segments.pop() || '';

  if (ext && result.endsWith(ext)) {
    result = result.slice(0, -ext.length);
  }

  return result;
}

function extname(path: string): string {
  if (!path || typeof path !== 'string') return '';

  const base = basename(path);
  const idx = base.lastIndexOf('.');

  if (idx <= 0) return '';
  return base.slice(idx);
}

export default {
  join,
  normalize,
  resolve,
  dirname,
  basename,
  extname,
  sep: '/',
  delimiter: ':',
  posix: { join, normalize, resolve, dirname, basename, extname, sep: '/', delimiter: ':' },
  win32: { join, normalize, resolve, dirname, basename, extname, sep: '\\', delimiter: ';' },
};

export { join, normalize, resolve, dirname, basename, extname };
