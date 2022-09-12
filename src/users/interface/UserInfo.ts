import { UserRole } from "../infra/entities/user.entity";

export interface UserInfo {
    id : number,
    email : string,
    role : UserRole,
}