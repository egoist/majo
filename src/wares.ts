import {Middleware} from './index'

export default class Wares {
  middlewares: Middleware[]
  constructor() {
    this.middlewares = []
  }

  use(middleware: Middleware[]) {
    this.middlewares = this.middlewares.concat(middleware)

    return this
  }

  run(context: any) {
    return this.middlewares.reduce((current, next) => {
      return current.then(() => Promise.resolve(next(context)))
    }, Promise.resolve())
  }
}
