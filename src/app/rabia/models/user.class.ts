export class User {
    id: string;
    username: string;
    email: string;

    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.username = obj ? obj.username : '';
        this.email = obj ? obj.email : '';
    }

    public toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
        }
    }
}