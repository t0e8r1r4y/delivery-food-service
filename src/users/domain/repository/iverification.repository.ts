import { UserEntity } from "../../infra/db/entities/user.entity";
import { VerificationEntity } from "../../../users/infra/db/entities/verification.entity";

export interface IVerificationRepository {
    // TODO - get 방식에 대해서 코드 정리 필요
    getVerificationCodeById : ( id : number ) => Promise<string>;
    getVerificationByCode : ( code : string ) => Promise<VerificationEntity>;

    /**
     * create Verification Entity Instance
     */
    createVerification : ( user : UserEntity ) => Promise<VerificationEntity>;

    /**
     * save Verification Entity in Persistence Context
     */
    saveVerification : ( verify : VerificationEntity ) => Promise<VerificationEntity>;

    /**
     * transaction commit in DB
     */
    commitTransactions : () => Promise<boolean>;

    /**
     * transaction rollback in DB
     */
    rollbackTransactions : () => Promise<boolean>;

    /**
     * delete Verification Entity in database
     */
    deleteVerification : ( id : number ) => Promise<boolean>;
}