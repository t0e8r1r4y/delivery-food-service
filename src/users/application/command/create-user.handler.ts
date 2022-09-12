import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserFactory } from "../../../users/domain/user.factory";
import { TryCatch } from "../../../common/trycatch.decorator";
import { UserRepository } from "../../infra/db/repository/user.repository";
import { VerificataionRepository } from "../../infra/db/repository/verification.repository";
import { CreateUserCommand } from "./create-user.command";

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {

    constructor(
        private userFactory: UserFactory,
        private readonly users : UserRepository,
        private readonly verifications : VerificataionRepository,
    ) {}

    @TryCatch('createUserHandler - ')
    async execute(command: CreateUserCommand): Promise<any> {
        const { email, password, role } = command;
        // 동일한 이메일로 기존에 계정이 있는지 확인
        const result = await this.users.beUserAccountExistByEmail(email);
        if(!result.ok) {
            throw new UnprocessableEntityException(result.error);
        }
        // 기존에 동일한 이메일로 가입 된 계정 없음 -> 계정 생성
        const userAccount = await this.users.createAccountAndSave( {email, password, role} );
        if( !userAccount.ok ) {
            throw new Error( userAccount.error );
        }
        // 계정 인증 생성
        const verification = await this.verifications.createAndSaveVerification(userAccount.user);
        if( !verification.ok ) {
            throw new Error( verification.error );
        }
        // 기존 서비스 처리와 다르게 인증 메일 발송은 이벤트로 처리해서 넘긴다.
        this.userFactory.create(userAccount.user.email, verification.verification.code);

        return { ok : true };
    }
}
