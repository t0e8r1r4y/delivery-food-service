import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { VerifyEmailCommand } from "./verify-email.command";
import { UserRepository } from "../../infra/db/repository/user.repository";
import { VerificataionRepository } from "../../infra/db/repository/verification.repository";
import { VerifyEmailOutput } from "../../../users/interface/dtos/verify-email.dto";
import { TryCatch } from "../../../common/decorator/trycatch.decorator";

@Injectable()
@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {

    constructor(
        private readonly users : UserRepository,
        private readonly verifications : VerificataionRepository,
    ) {}

    @TryCatch('verifyEmailHandler - ')
    async execute(command: VerifyEmailCommand): Promise<VerifyEmailOutput> {
        const { code } = command;
        // 인증 코드 조회
        const verification = await this.verifications.getVerificationByCode(code);
        if(!verification.ok) {
            throw new Error(verification.error);    
        }
        // 인증 완료 정보 수정
        verification.verification.user.verified = true;
        // 인증 완료 정보 수정 저장
        const editUserAccount = await this.users.saveUserAccount(verification.verification.user);
        if(!editUserAccount.ok) {
            throw new Error(editUserAccount.error);
        }
        // 인증이 완료되었으므로 인증에 대한 삭제
        await this.verifications.deleteVerification(verification.verification.id);

        return { ok: true };
    }

}