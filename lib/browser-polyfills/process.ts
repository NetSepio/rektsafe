// Browser polyfill for Node.js process module

const process = {
  cwd: () => "/",
  env: typeof window !== "undefined" ? (window as any).__env || {} : {},
  nextTick: (callback: (...args: any[]) => void, ...args: any[]) => {
    setTimeout(() => callback(...args), 0);
  },
  version: "",
  versions: {},
  platform: "browser",
  arch: "browser",
  pid: 0,
  ppid: 0,
  title: "browser",
  argv: [],
  execArgv: [],
  execPath: "",
  stdout: null,
  stderr: null,
  stdin: null,
  exit: (code?: number) => {
    console.log(`Process exit with code ${code}`);
  },
  on: () => {},
  once: () => {},
  emit: () => false,
  addListener: () => {},
  removeListener: () => {},
  removeAllListeners: () => {},
};

export default process;
