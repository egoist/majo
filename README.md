# majo

<a href="https://www.pixiv.net/member_illust.php?mode=medium&illust_id=62542828">
<img src="https://ooo.0o0.ooo/2017/04/27/59016709425c9.jpg" width="300" />
</a>

_Art by [でんでん COMIC1・こ 24b](https://www.pixiv.net/member.php?id=12192)_

[![NPM version](https://img.shields.io/npm/v/majo.svg?style=flat)](https://npmjs.com/package/majo) [![NPM downloads](https://img.shields.io/npm/dm/majo.svg?style=flat)](https://npmjs.com/package/majo) [![CircleCI](https://circleci.com/gh/egoist/majo/tree/master.svg?style=shield&circle-token=560404744e167900959a512d617a05ec5240616f)](https://circleci.com/gh/egoist/majo/tree/master) [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate)

## Introduction

You can use _majo_ to manipulate files like a pro, with a simple API whose core is only ≈ 150 SLOC.

## Install

```bash
yarn add majo
```

## Usage

```js
const { majo } = require('majo')

const stream = majo()

// Given that you have js/app.js js/index.js
stream
  .source('js/**')
  .use(ignoreSomeFiles)
  .dest('dist')
  .then(() => {
    // Now you got filtered files
  })

function ignoreSomeFiles(stream) {
  for (const filename in stream.files) {
    const content = stream.fileContents(filename)
    // Remove it if content has specific string
    if (/some-string/.test(content)) {
      delete stream.files[filename]
    }
  }
}
```

## Middleware context

A middleware receives a `MajoContext` containing the loaded `files`, their
`baseDir`, and the `meta` object shared by all middleware in the pipeline. File
operations belong to this context and run immediately. The `Majo` stream itself
configures the pipeline with `source`, `use`, `filter`, `process`, and `dest`.

```js
const stream = majo()
  .source('**/*.txt')
  .use(async context => {
    context.rename('notes.txt', 'archive/notes.txt')
    await context.transform('archive/notes.txt', text => text.toUpperCase())
    context.meta.processed = true
  })

await stream.dest('dist')
console.log(stream.fileList, stream.meta.processed)
```

`context.filter` filters loaded files immediately; `stream.filter` schedules a
filter in the pipeline. Async middleware and `context.transform` must be awaited.
`process` and `dest` still return the stream, whose `files`, `fileList`, `file`,
`fileContents`, and `fileStats` provide access to the results.

**Migration:** move calls to `rename`, `createFile`, `deleteFile`, `writeContents`,
and `transform` from the stream into a `use(context => ...)` callback. These
mutating methods are no longer on `Majo`, so they cannot silently run before the
source has loaded. TypeScript middleware annotations should use `Middleware` or
`MajoContext` instead of `Majo`.

## Documentation

https://majo.egoist.sh

## Used By

- [SAO](https://github.com/egoist/sao): ⚔️ Futuristic scaffolding tool.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

**majo** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/majo/contributors)).

> [egoist.moe](https://egoist.moe) · GitHub [@egoist](https://github.com/egoist) · Twitter [@\_egoistlily](https://twitter.com/_egoistlily)
