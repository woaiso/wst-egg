export default class Auth {
    private userName: string;
    private password: string;
    public getUserName(): string {
        return this.userName;
    }
    public setUserName( userName: string ) {
        this.userName = userName;
    }
    public getPassword(): string {
        return this.password;
    }
    public setPassword( password: string ) {
        this.password = password;
    }
}