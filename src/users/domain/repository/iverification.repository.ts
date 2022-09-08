import { verificationRepositoryResult } from "../../../users/dtos/repository-result.dtp";
import { User } from "../../../users/entities/user.entity";

// TODO - dto에 대한 통일 된 정리가 필요함.
export interface IVerificationRepository {
    createAndSaveVerification : ( user : User ) => Promise<verificationRepositoryResult>;
    deleteVerification : ( id : number ) => Promise<void>;
    getVerificationByCode : ( code : string ) => Promise<verificationRepositoryResult>;
}