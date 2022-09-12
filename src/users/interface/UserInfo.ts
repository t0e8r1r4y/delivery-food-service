import { UserRole } from "../entities/user.entity";

export interface UserInfo {
    id : number,
    email : string,
    role : UserRole,
}