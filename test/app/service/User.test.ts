import * as assert from 'assert';
import { Context } from 'egg';
import { app } from 'egg-mock/bootstrap';

describe( 'test/app/service/Test.test.js', () => {
    let ctx: Context;

    before( async () => {
        ctx = app.mockContext();
    } );

    it( '创建用户', async () => {
        const result = await ctx.service.githubAuth.createUser( {
            userName: 'test',
            password: '123456',
            provider: 'github',
        } );
        assert( result === true );
    } );
} );
