import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserFactory } from "../../../users/domain/user.factory";
import { TryCatch } from "../../../common/decorator/trycatch.decorator";
import { UserRepository } from "../../infra/db/repository/user.repository";
import { VerificataionRepository } from "../../infra/db/repository/verification.repository";
import { CreateUserCommand } from "./create-user.command";
import { CreateAccountOutput } from "../../../users/interface/dtos/create-acoount.dto";

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
        const verification = await this.verifications.createAndSaveVerification(userAccountResult.user);
        if( !verification.ok ) {
            // TODO - 수동 트랜잭션으로 여기서 계정생성과 인증코드 생성이 안되면 모든 처리를 rollback해야 함.
            this.users.deleteUserAccount(userAccountResult.user);
            throw new Error( verification.error );
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
