# Middleware

A middleware is a function that accepts majo instance as the first argument:

```js
function myMiddleware(context) {
  // Remove a file
  delete context.files['dist/bundle.js']
}
```

> **Note:**
>
> `this` in middleware is also pointed to `context`

