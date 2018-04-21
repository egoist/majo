# Middleware

A middleware is a function that accepts majo instance as the first argument:

```js
function myMiddleware(context) {
  // Remove a file
  delete context.files['dist/bundle.js']
}
```

The middleware function could be synchronous or asynchronous by returning a Promise.

The `context` is basically the [`stream`](./api.md) instance.
