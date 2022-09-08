import { CustomRepository } from "../../common/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { verificationRepositoryResult } from "../dtos/repository-result.dtp";
import { User } from "../entities/user.entity";
import { Verification } from "../entities/verification.entity";
import { TryCatch } from "../../common/trycatch.decorator";
import { NotFoundException } from "@nestjs/common";
import { IVerificationRepository } from "../domain/repository/iverification.repository";

@CustomRepository(Verification)
export class VerificataionRepository extends Repository<Verification> implements IVerificationRepository {

    @TryCatch('save fail - ')
    async createAndSaveVerification( user : User ) : Promise<verificationRepositoryResult> {
        const verification = await this.save(
            this.create({
                user: user
            }),
        )

        if(!verification) {
            throw new Error('인증 생성 후 저장 실패');
        }

        return { ok:true, verification: verification };
    }

    @TryCatch('delete fail - ')
    async deleteVerification( id : number ) : Promise<void> {
        await this.delete({
            user : {
                id : id,
            }
        });
    }

    @TryCatch('getVerificationByCode fail - ')
    async getVerificationByCode( code : string ) : Promise<verificationRepositoryResult> {
        const verify = await this.findOne({
            where : {
                code : code,
            },
            relations: ['user']
        });

        if(!verify) {
            throw new NotFoundException('인증값을 찾지 못했습니다.');
        }

        return {ok : true, verification: verify};
    }
}