import { verificationRepositoryResult } from "../../interface/dtos/repository-result.dtp";
import { User } from "../../infra/entities/user.entity";

// TODO - dto에 대한 통일 된 정리가 필요함.
export interface IVerificationRepository {
    createAndSaveVerification : ( user : User ) => Promise<verificationRepositoryResult>;
    deleteVerification : ( id : number ) => Promise<void>;
    getVerificationByCode : ( code : string ) => Promise<verificationRepositoryResult>;
}