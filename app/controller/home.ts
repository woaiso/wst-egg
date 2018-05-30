import { Controller } from 'egg';

export default class HomeController extends Controller {
  public async index() {
    const { ctx } = this;
    console.log(ctx.user);
    await ctx.render( 'index.nj', { user: ctx.user } );
  }
}
