declare module 'ware' {
  export type Next = (err?: Error) => any
  type Middleware = (context: any, next: Next) => any | Promise<any>

  export class WareConstuctor {
    public use(middleware: Middleware | Middleware[]): this
    public run(context: any, callback: (err: Error, context: any) => void): void
  }

  type Ware = () => WareConstuctor

  let ware: Ware

  export default ware
}
