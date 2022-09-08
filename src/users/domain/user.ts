export class UserDomain {
    constructor(
        readonly email : string,
        readonly password : string,
        readonly role : string,
        readonly verified : boolean,
    ) {}

    getEmail() : Readonly<string> {
        return this.email;
    }

    getPassword() : Readonly<string> {
        return this.password;
    }

    getRole() : Readonly<string> {
        return this.role;
    }

    getVerified() : Readonly<boolean> {
        return this.verified;
    }
}