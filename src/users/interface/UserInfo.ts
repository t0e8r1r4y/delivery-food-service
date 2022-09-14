import { UserRole } from "../infra/db/entities/user.entity";

export interface UserInfo {
    id : number,
    email : string,
    role : UserRole,
}