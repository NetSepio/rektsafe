// ffjavascript imports the `web-worker` package. Its Node entry uses
// require(variable), which Webpack flags and cannot bundle. Proofs run in
// the browser, so use the global Worker.
module.exports = globalThis.Worker;
