import { CreateAccountInput } from "../../interface/dtos/create-acoount.dto";
import { repositoryResult } from "../../interface/dtos/repository-result.dtp";
import { User } from "../../infra/entities/user.entity";

// TODO - dto에 대한 통일 된 정리가 필요함.
export interface IUserRepository {
    getUserAccountByEmail : ( email : string ) => Promise<repositoryResult>;
    beUserAccountExistByEmail : ( email : string ) => Promise<repositoryResult>;
    getUserAccountById : ( id : number ) => Promise<repositoryResult>;
    createAccountAndSave : ( { email, password, role} : CreateAccountInput ) => Promise<repositoryResult>;
    saveUserAccount : ( user : User ) => Promise<repositoryResult>;
}