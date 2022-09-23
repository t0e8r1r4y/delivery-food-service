import { UserRole } from "../infra/db/entities/user.entity";

export class User {

    constructor(
        readonly id : number,
        readonly email : string,
        readonly password : string,
        readonly userRole : UserRole,
        readonly verified : boolean,
        readonly createdAt : Date,
        readonly updatedAt : Date,
    ) {}

}