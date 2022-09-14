import { verificationRepositoryResult } from "../../interface/dtos/repository-result.dto";
import { UserEntity } from "../../infra/db/entities/user.entity";

// TODO - dto에 대한 통일 된 정리가 필요함.
export interface IVerificationRepository {
    createAndSaveVerification : ( user : UserEntity ) => Promise<verificationRepositoryResult>;
    deleteVerification : ( id : number ) => Promise<void>;
    getVerificationByCode : ( code : string ) => Promise<verificationRepositoryResult>;
}