import { CustomRepository } from "../../../../common/class-decorator.ts/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { UserEntity } from "../entities/user.entity";
import { VerificationEntity } from "../entities/verification.entity";
import { TryCatch } from "../../../../common/method-decorator/trycatch.decorator";
import { NotFoundException } from "@nestjs/common";
import { IVerificationRepository } from "../../../domain/repository/iverification.repository";

// UserRepository와 달리 CustomRepo로 코드를 작성하였습니다.
@CustomRepository(VerificationEntity)
export class VerificataionRepository extends Repository<VerificationEntity> implements IVerificationRepository {
    
    @TryCatch('/VerificataionRepository/getVerificationCodeById')
    async getVerificationCodeById(
        id: number
    ) : Promise<string> {
        const verify = await this.findOne({
            where : {
                id : id,
            }
        });

        if(!verify){
            throw new Error('/인증 정보를 찾을 수 없습니다.');
        }

        return verify.code;
    }


    @TryCatch('/VerificataionRepository/createVerification')
    async createVerification(
        user: UserEntity
    ) : Promise<VerificationEntity> {
        const verify = this.create({
            user : {
                id: user.id
            }
        });
        if(!verify) {
            throw new Error('/인증 정보를 정상 생성하지 못했습니다.');
        }
        return verify;
    }

    @TryCatch('/VerificataionRepository/saveVerification')
    async saveVerification (
        verify: VerificationEntity
    ) : Promise<VerificationEntity> {

        let saveVerifiy : VerificationEntity = null;
        let errorMsg : string = null;

        const queryRunner = await this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            saveVerifiy = await queryRunner.manager.save(verify);
        } catch (error) {
            errorMsg = error.message;
        } finally {
            await queryRunner.release();
        }

        if(errorMsg !== null) {
            throw new Error('/'+errorMsg);
        }

        return saveVerifiy;
    }

    @TryCatch('/VerificataionRepository/commitTransaction')
    async commitTransactions() : Promise<boolean> {
        
        let errorMsg : string = null;

        const queryRunner = await this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            errorMsg = error.message;
        } finally {
            await queryRunner.release();
        }

        if(errorMsg !== null) {
            throw new Error('/'+errorMsg);
        }

        return true;
    }

    @TryCatch('/VerificataionRepository/rollbackTransaction')
    async rollbackTransactions() : Promise<boolean> {
        
        let errorMsg : string = null;
        
        const queryRunner = await this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.rollbackTransaction();
        } catch (error) {
            errorMsg = error.message;
        } finally {
            await queryRunner.release();
        }

        if(errorMsg !== null) {
            throw new Error('/'+errorMsg);
        }

        return true;
    }


    @TryCatch('/VerificataionRepository/deleteVerification')
    async deleteVerification( id : number ) : Promise<boolean> {
        await this.delete({
            user : {
                id : id,
            }
        });

        return true;
    }

    @TryCatch('/VerificataionRepository/deleteVerificationById')
    async deleteVerificationById( id : number ) : Promise<boolean> {
        await this.delete(id);
        return true;
    }

    @TryCatch('/VerificataionRepository/getVerificationByCode')
    async getVerificationByCode( 
        code : string 
    ) : Promise<VerificationEntity> {
        const verify = await this.findOne({
            where : {
                code : code,
            },
            relations: ['user']
        });

        if(!verify) {
            throw new NotFoundException('/인증값을 찾지 못했습니다.');
        }

        return verify;
    }
}