import { MajoContext, Middleware } from './'

export default class Wares {
  middlewares: Middleware[]

  constructor() {
    this.middlewares = []
  }

  use(middleware: Middleware | Middleware[]) {
    this.middlewares = this.middlewares.concat(middleware)

    return this
  }

  run(context: MajoContext): Promise<void> {
    return this.middlewares.reduce((current: Promise<void>, next) => {
      return current.then(() =>
        Promise.resolve(next(context)).then(() => undefined)
      )
    }, Promise.resolve())
  }
}
