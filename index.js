const dist = require('./dist')

// Make `majo` available as default export
// So that it's compatiable with majo <= 0.8
// Probably remove in the future
module.exports = dist.majo
Object.assign(module.exports, dist)
