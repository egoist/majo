# majo

[![NPM version](https://img.shields.io/npm/v/majo.svg?style=flat)](https://npmjs.com/package/majo) [![NPM downloads](https://img.shields.io/npm/dm/majo.svg?style=flat)](https://npmjs.com/package/majo) [![CircleCI](https://circleci.com/gh/egoist/majo/tree/master.svg?style=shield)](https://circleci.com/gh/egoist/majo/tree/master)  [![donate](https://img.shields.io/badge/$-donate-ff69b4.svg?maxAge=2592000&style=flat)](https://github.com/egoist/donate)

## Install

```bash
yarn add majo
```

## Usage

```js
const majo = require('majo')

const stream = majo()

// Given that you have js/app.js js/index.js
stream
  .source('js/**')
  .dest('dist')
  .then(() => {
    // Now you got dist/js/app.js dist/js/index.js
  })
```

## Support

[API docs](/docs/api.md)<br>
[Middleware](/docs/middleware.md)

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## Author

**majo** © [egoist](https://github.com/egoist), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by egoist with help from contributors ([list](https://github.com/egoist/majo/contributors)).

> [egoistian.com](https://egoistian.com) · GitHub [@egoist](https://github.com/egoist) · Twitter [@rem_rin_rin](https://twitter.com/rem_rin_rin)
