import AuthModel from './../model/Auth';

export interface Auth {
    login( auth: AuthModel ): Promise<any>;
}
