import { CreateAccountInput } from "../../interface/dtos/create-acoount.dto";
import { repositoryResult } from "../../interface/dtos/repository-result.dto";
import { UserEntity } from "../../infra/db/entities/user.entity";

// TODO - dto에 대한 통일 된 정리가 필요함.
export interface IUserRepository {
    /**
     * check user account in database.
     */
    beUserAccountExistByEmail : ( email : string ) => Promise<repositoryResult>;

    /**
     * get User Entity by key. email or id are possible to be key.
     */
    getUserAccountBy : ( key : string | number ) => Promise<repositoryResult>;

    /**
     * create User Entity instance.
     */
    createUserAccount : ( { email, password, role} : CreateAccountInput ) => Promise<repositoryResult>;

    /**
     * save User Entity in persistence context.
     * before I user 'saveUserAccount : ( user : UserEntity ) => Promise<repositoryResult>'.
     * but when I control transaction UserRpository and Verification Repository.
     * so devide this method, make 'save' , 'commit', 'rollback' method.
     */
    saveUserAccount : ( user : UserEntity ) => Promise<repositoryResult>;

    /**
     * commit Transcation in this Repository.
     */
    commitTransaction : () => Promise<repositoryResult>;

    /**
     * rollback Transcation in this Repository.
     */
    rollbackTransaction : () => Promise<repositoryResult>;

    /**
     * delete User Entity in database
     */
    deleteUserAccount : ( user : UserEntity ) => Promise<repositoryResult>;
}