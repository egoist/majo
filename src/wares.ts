export type Middleware = (context: any) => any

export default class Wares {
  private middlewares: Middleware[]

  constructor() {
    this.middlewares = []
  }

  use(middleware: Middleware | Middleware[]) {
    this.middlewares = this.middlewares.concat(middleware)

    return this
  }

  run(context: any) {
    return this.middlewares.reduce((current, next) => {
      return current.then(() => Promise.resolve(next(context)))
    }, Promise.resolve())
  }
}
