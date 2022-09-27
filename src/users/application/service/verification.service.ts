import { Injectable } from "@nestjs/common";
import { VerificationEntity } from "src/users/infra/db/entities/verification.entity";
import { UserEntity } from "../../../users/infra/db/entities/user.entity";
import { VerificataionRepository } from "../../../users/infra/db/repository/verification.repository";
import { TryCatch } from "../../../common/method-decorator/trycatch.decorator";

@Injectable()
export class VerificationService {
    constructor(
        private readonly verifications : VerificataionRepository,
    ) {}

    @TryCatch('/Verifications/createAndSaveVerification')
    async createAndSaveVerification( 
        user : UserEntity
    ) : Promise<string> {
        const userVerify = await this.verifications.createVerification( user );
        const saveResult = await this.verifications.saveVerification(userVerify);
        await this.verifications.commitTransactions();
        return saveResult.code;
    }

    @TryCatch('/Verifications/deleteVerification')
    async deleteVerificationByCode(
        code : string
    ) : Promise<boolean> {
        const verify = await this.verifications.getVerificationByCode(code);
        const result = await this.verifications.deleteVerification(verify.user.id); 
        return result;
    }

    @TryCatch('/Verifications/deleteVerificationByUserId')
    async deleteVerificationByUserId(
        userId : number
    ) : Promise<boolean> {
        const userVerify = await this.verifications.findOne({
            where : { user : { id : userId, } }
        });
        if(userVerify) {
            await this.verifications.deleteVerificationById(userVerify.id);
            return true;
        }
        return false;
    }

    @TryCatch('/Verifications/getVerificationByUserId')
    async getVerificationByCode(
        code : string
    ) : Promise<VerificationEntity> {
        return await this.verifications.getVerificationByCode(code);        
    }

}