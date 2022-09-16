import { CustomRepository } from "../../../../common/typeorm-ex.decorator";
import { EntityManager, Repository } from "typeorm";
import { verificationRepositoryResult } from "../../../interface/dtos/repository-result.dto";
import { UserEntity } from "../entities/user.entity";
import { Verification } from "../entities/verification.entity";
import { TryCatch } from "../../../../common/decorator/trycatch.decorator";
import { NotFoundException } from "@nestjs/common";
import { IVerificationRepository } from "../../../domain/repository/iverification.repository";

@CustomRepository(Verification)
export class VerificataionRepository extends Repository<Verification> implements IVerificationRepository {
    
    @TryCatch('Fail to find verified code instance - ')
    async getVerificationCode(
        id: number
    ) : Promise<string> {
        const verify = await this.findOne({
            where : {
                id : id,
            }
        });

        if(!verify){
            throw new Error('인증 정보를 찾을 수 없습니다.');
        }

        return verify.code;
    }


    @TryCatch('Fail to create Verify instance - ')
    async createVerification(
        user: UserEntity
    ) : Promise<verificationRepositoryResult> {
        const verify = this.create({
            user : {
                id: user.id
            }
        });
        if(!verify) {
            throw new Error('인증 정보를 정상 생성하지 못했습니다.');
        }
        return {ok: true, verification: verify};
    }

    async saveVerification (
        verify: Verification
    ) : Promise<verificationRepositoryResult> {
        let isResult : verificationRepositoryResult = {ok:false, };
        const queryRunner = await this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.save(verify);
        } catch (error) {
            isResult.error = error;
        } finally {
            await queryRunner.release();
            isResult.ok = true;
            isResult.verification = verify;
        }

        return isResult;
    }

    async commitTransaction() : Promise<verificationRepositoryResult> {
        let isResult : verificationRepositoryResult = {ok:false, };
        const queryRunner = await this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.commitTransaction();
        } catch (error) {
            isResult.error = error;
        } finally {
            await queryRunner.release();
            isResult.ok = true;
        }
        return isResult;
    }

    async rollbackTransaction() : Promise<verificationRepositoryResult> {
        let isResult : verificationRepositoryResult = {ok:false, };
        const queryRunner = await this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.rollbackTransaction();
        } catch (error) {
            isResult.error = error;
        } finally {
            await queryRunner.release();
            isResult.ok = true;
        }
        return isResult;
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