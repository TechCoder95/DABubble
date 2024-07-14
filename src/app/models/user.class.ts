export class User {
    id: string;
    fullName: string;
    email: string;
    password: string

    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.fullName = obj ? obj.fullName : '';
        this.email = obj ? obj.email : '';
        this.password = obj ? obj.password : '';
    }
}