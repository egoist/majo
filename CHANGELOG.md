# [1.0.0](https://github.com/egoist/majo/compare/v0.8.0...v1.0.0) (2019-11-14)

### Features

- rewrite in typescript ([d07511e](https://github.com/egoist/majo/commit/d07511e268d187d34c856a3742ec6e69afa011b0))

 BREAKING CHANGES:
    
default export is now removed, use named export `majo` instead:

```js
const { majo } = require('majo')
// or
import { majo } from 'majo'
```
