import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserFactory } from "../../../users/domain/user.factory";
import { TryCatch } from "../../../common/decorator/trycatch.decorator";
import { VerificataionRepository } from "../../infra/db/repository/verification.repository";
import { CreateUserCommand } from "./create-user.command";
import { CreateAccountOutput } from "../../../users/interface/dtos/create-acoount.dto";
import { UserRepository } from "../../../users/infra/db/repository/user.repository";

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {

    constructor(
        private userFactory: UserFactory,
        private readonly users : UserRepository,
        private readonly verifications : VerificataionRepository,
    ) {}

    @TryCatch('createUserHandler - ')
    async execute(command: CreateUserCommand): Promise<CreateAccountOutput> {
        const { email, password, role } = command;
        // 동일한 이메일로 기존에 계정이 있는지 확인
        const result = await this.users.beUserAccountExistByEmail(email);
        if(!result.ok) {
            throw new UnprocessableEntityException(result.error);
        }
        // 기존에 동일한 이메일로 가입 된 계정 없음 -> 계정 생성
        const userAccountResult = await this.users.createUserAccount( {email, password, role} );
        if( !userAccountResult.ok ) {
            throw new Error( userAccountResult.error );
        }

        // 생성 인증이 정상적으로 저장 되면 유저 정보도 저장
        const saveResult = await this.users.saveUserAccount(userAccountResult.user);
        if(!saveResult.ok) {
            throw new Error( saveResult.error );
        }
        // 계정 인증 생성
        const verification = await this.verifications.createVerification(userAccountResult.user);
        if(!verification.ok || verification.verification.user.id !== userAccountResult.user.id) {
            await this.verifications.rollbackTransaction();
            await this.users.rollbackTransaction();
            throw new Error( verification.error );
        }
        // 계정 인증 저장
        const verificationSaveResult = await this.verifications.saveVerification(verification.verification);
        if(!verificationSaveResult.ok) {
            await this.verifications.rollbackTransaction();
            await this.users.rollbackTransaction();
            throw new Error( verificationSaveResult.error );
        }

        // 계정 인증 커밋
        const commitResult = await this.verifications.commitTransaction();
        if(!commitResult.ok) {
            await this.verifications.rollbackTransaction();
            await this.users.rollbackTransaction();
            throw new Error( commitResult.error );
        }

        // 사용자 계정 커밋
        const commitUser = await this.users.commitTransaction();
        if(!commitUser.ok) {
            await this.verifications.deleteVerification(verification.verification.id);
            await this.users.rollbackTransaction();
            throw new Error( commitUser.error );
        }

        // 기존 서비스 처리와 다르게 인증 메일 발송은 이벤트로 처리해서 넘긴다.
        this.userFactory.create( 
            userAccountResult.user.id, userAccountResult.user.email, userAccountResult.user.password,
            userAccountResult.user.role, userAccountResult.user.verified, 
            userAccountResult.user.createdAt, userAccountResult.user.updatedAt, 
            verification.verification.code
        );
        return { ok : true };
    }
}
