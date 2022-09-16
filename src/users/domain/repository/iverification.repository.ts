import { verificationRepositoryResult } from "../../interface/dtos/repository-result.dto";
import { UserEntity } from "../../infra/db/entities/user.entity";
import { Verification } from "src/users/infra/db/entities/verification.entity";

// TODO - dto에 대한 통일 된 정리가 필요함.
export interface IVerificationRepository {
    createVerification : ( user : UserEntity ) => Promise<verificationRepositoryResult>;
    saveVerification : ( verify : Verification ) => Promise<verificationRepositoryResult>;
    commitTransaction : () => Promise<verificationRepositoryResult>;
    rollbackTransaction : () => Promise<verificationRepositoryResult>;
    deleteVerification : ( id : number ) => Promise<void>;
    getVerificationByCode : ( code : string ) => Promise<verificationRepositoryResult>;
}