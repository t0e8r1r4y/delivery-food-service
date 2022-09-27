import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EditUserCommand } from "./edit-user.command";
import { UserRepository } from "../../infra/db/repository/user.repository";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";
import { EditProfileOutput } from "../../../users/interface/dtos/edit-profile.dto";
import { UserFactory } from "../../../users/domain/user.factory";
import { VerificationService } from "../service/verification.service";

@Injectable()
@CommandHandler(EditUserCommand)
export class EditUserHandler implements ICommandHandler<EditUserCommand> {
    
    constructor(
        // private userFactory: UserFactory,
        private readonly users : UserRepository,
        private readonly verification : VerificationService,
    ) {}
    
    @TryCatchService('/EditUserHandler/execute')
    async execute(command: EditUserCommand) : Promise<EditProfileOutput> {
        const { id, email, password } = command;
        let code : string = null;
        // 입력 검증 - 둘다 없으면 해당 로직을 실행하지 않습니다.
        if( !email && !password ) {
            throw new Error('수정할 내용이 없습니다.')
        }
        // 수정을 할 계정 조회
        const editUserAccount = await this.users.getUserAccountBy(id);
        // 이메일이 있으면 이메일 수정
        if( email ) {
            // 수정 정보 반영
            editUserAccount.email = email;
            // 기존 인증 정보가 있다면 모두 무효처리
            editUserAccount.verified = false;
            await this.verification.deleteVerificationByUserId(editUserAccount.id);
            // 새로운 인증을 생성
            code = await this.verification.createAndSaveVerification(editUserAccount);
            if( code === null ) {
                await this.verification.deleteVerificationByCode(code);
                throw new Error('/계정 인증코드를 정상 생성하지 못했습니다.');
            }
        }
        // 비밀번호가 있으면 비번 수정
        if( password ) {
            editUserAccount.password = password;
        }
        // 수정 내용 저장
        const updateUserAccount = await this.users.saveUserAccount(editUserAccount);
        // 수정 내용 커밋
        await this.users.commitTransaction();
        // user 인스턴스를 생성하면서, 이벤트로 인증 메일 발송

        // TODO - Front에서 생성된 user 객체의 정보를 요청 할 경우 위 생성 객체를 결과로 전달.
        // this.userFactory.create(
        //     updateUserAccount.id, updateUserAccount.email, updateUserAccount.password,
        //     updateUserAccount.role, updateUserAccount.verified, 
        //     updateUserAccount.createdAt, updateUserAccount.updatedAt, 
        //     code
        // );
        return { ok: true, };
    }
    
}