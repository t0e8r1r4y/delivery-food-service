import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserFactory } from "../../../users/domain/user.factory";
import { CreateUserCommand } from "./create-user.command";
import { CreateAccountOutput } from "../../../users/interface/dtos/create-acoount.dto";
import { UserRepository } from "../../../users/infra/db/repository/user.repository";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";
import { VerificationService } from "../service/verification.service";

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {

    constructor(
        private readonly users : UserRepository,
        // User와 관련된 기능에 포함되는 서비스라 별도로 외부 service로 분리하지 않음.
        private readonly verification : VerificationService,
    ) {}

    @TryCatchService('/CreateUserHandler/execute')
    async execute(command: CreateUserCommand): Promise<CreateAccountOutput> {
        const { email, password, role } = command;
        // 계정 존재 유무 확인
        await this.users.beUserAccountExistByEmail(email);
        // 사용자 계정 인스턴스 생성
        const userAccount = await this.users.createUserAccount( {email, password, role} );
        // 사용자 계정 인스턴스 저장
        const saveUserAccountResult = await this.users.saveUserAccount(userAccount);
        // 인증 코드 생성
        const verificationCode = await this.verification.createAndSaveVerification(saveUserAccountResult);
        // 인증 코드 생성 실패 시 사용자 계정 생성 실패
        if(verificationCode === null) {
            await this.users.rollbackTransaction();
            await this.verification.deleteVerificationByCode(verificationCode);
            throw new Error('/계정 인증코드를 정상 생성하지 못했습니다.');
        }
        // 인증 코드 생성이 완료되면 사용자 계정 DB 커밋
        await this.users.commitTransaction();
        // user 인스턴스를 생성하면서, 이벤트로 인증 메일 발송

        /**
         * TODO - Front에서 생성된 user 객체의 정보를 요청 할 경우 위 생성 객체를 결과로 전달.
         * 
        this.userFactory.create( 
            saveUserAccountResult.id, saveUserAccountResult.email, saveUserAccountResult.password,
            saveUserAccountResult.role, saveUserAccountResult.verified, 
            saveUserAccountResult.createdAt, saveUserAccountResult.updatedAt, 
            verificationCode
        );
         */
        return { ok : true, error: null };
    }
}
