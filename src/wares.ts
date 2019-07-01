import { Majo } from '.';

export type Middleware = (ctx: Majo) => Promise<void> | void;

export default class Wares {
  private middlewares: Middleware[] = [];

  use(middleware: Middleware | Middleware[]): Wares {
    this.middlewares = this.middlewares.concat(middleware);

    return this;
  }

  run(context: Majo): Promise<void> {
    return this.middlewares.reduce((current, next) => {
      return current.then(() => Promise.resolve(next(context)));
    }, Promise.resolve());
  }
}
