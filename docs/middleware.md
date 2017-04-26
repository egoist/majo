# Middleware

A middleware is a function thay accepts middleware context as the first argument:

```js
function myMiddleware(context) {
  // Remove a file
  delete context.files['dist/bundle.js']
}
```

## context

### files

`context.files` is an object and each entry of it is a file path:

```js
{
  'src/index.js': {
    contents: Buffer<...>,
    stat: {}, // an fs.Stats object
    path: '/absolute/path/to/src/index.js'
  }
}
```

### cwd

The directory we find source files in.

### transform(relative, handler)

#### relative

Relative path.

#### handler(decodedContents)

##### decodedContents

Type: `string`<br>
Encoding: `utf-8`

Decoded file content, a string in `utf-8` encoding.

It should return a transformed `utf-8`string or a Promise which resolves such string.

### meta

Type: `Object`<br>
Default: `{}`

An object which is shared across middlewares, you can use this to pass down data from a middleware to another.
