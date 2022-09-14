import { CreateAccountInput } from "../../interface/dtos/create-acoount.dto";
import { repositoryResult } from "../../interface/dtos/repository-result.dto";
import { UserEntity } from "../../infra/db/entities/user.entity";

// TODO - dto에 대한 통일 된 정리가 필요함.
export interface IUserRepository {
    beUserAccountExistByEmail : ( email : string ) => Promise<repositoryResult>;
    getUserAccountBy : ( key : string | number ) => Promise<repositoryResult>;
    createUserAccount : ( { email, password, role} : CreateAccountInput ) => Promise<repositoryResult>;
    saveUserAccount : ( user : UserEntity ) => Promise<repositoryResult>;
    deleteUserAccount : ( user : UserEntity ) => Promise<repositoryResult>;
}