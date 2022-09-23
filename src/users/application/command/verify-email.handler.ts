import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { VerifyEmailCommand } from "./verify-email.command";
import { UserRepository } from "../../infra/db/repository/user.repository";
import { VerifyEmailOutput } from "../../../users/interface/dtos/verify-email.dto";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";
import { VerificationService } from "../service/verification.service";

@Injectable()
@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {

    constructor(
        private readonly users : UserRepository,
        private readonly verification : VerificationService,
    ) {}

    @TryCatchService('/VerifyEmailHandler/execute')
    async execute(command: VerifyEmailCommand): Promise<VerifyEmailOutput> {
        const { code } = command;
        // 인증 코드 조회
        const verification = await this.verification.getVerificationByCode(code);
        // 인증 완료 정보 수정
        verification.user.verified = true;
        // 인증 완료 정보 수정 저장
        const editUserAccount = await this.users.saveUserAccount(verification.user);

        if(!editUserAccount) {
            await this.users.rollbackTransaction();
            throw new Error('/인증 결과를 정상 저장하지 못했습니다.');
        }
        // 인증이 완료되었으므로 인증에 대한 삭제
        await this.verification.deleteVerificationByUserId(verification.user.id);
        await this.users.commitTransaction();

        return { ok: true };
    }

}