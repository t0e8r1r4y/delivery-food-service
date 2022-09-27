import { CreateAccountInput } from "../../interface/dtos/create-acoount.dto";
import { UserEntity } from "../../infra/db/entities/user.entity";

// TODO - dto에 대한 통일 된 정리가 필요함.
export interface IUserRepository {
    /**
     * check user account in database.
     */
    beUserAccountExistByEmail : ( email : string ) => Promise<boolean>;

    /**
     * get User Entity by key. email or id are possible to be key.
     */
    getUserAccountBy : ( key : string | number ) => Promise<UserEntity>;

    /**
     * create User Entity instance.
     */
    createUserAccount : ( { email, password, role} : CreateAccountInput ) => Promise<UserEntity>;

    /**
     * save User Entity in persistence context.
     * before I user 'saveUserAccount : ( user : UserEntity ) => Promise<repositoryResult>'.
     * but when I control transaction UserRpository and Verification Repository.
     * so devide this method, make 'save' , 'commit', 'rollback' method.
     */
    saveUserAccount : ( user : UserEntity ) => Promise<UserEntity>;

    /**
     * commit Transcation in this Repository.
     */
    commitTransaction : () => Promise<boolean>;

    /**
     * rollback Transcation in this Repository.
     */
    rollbackTransaction : () => Promise<boolean>;

    /**
     * delete User Entity in database
     */
    deleteUserAccount : ( user : UserEntity ) => Promise<boolean>;
}