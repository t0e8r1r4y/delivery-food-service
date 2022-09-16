import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EditUserCommand } from "./edit-user.command";
import { UserRepository } from "../../infra/db/repository/user.repository";
import { TryCatch } from "../../../common/decorator/trycatch.decorator";
import { EditProfileOutput } from "../../../users/interface/dtos/edit-profile.dto";
import { VerificataionRepository } from "../../infra/db/repository/verification.repository";
import { UserFactory } from "../../../users/domain/user.factory";

@Injectable()
@CommandHandler(EditUserCommand)
export class EditUserHandler implements ICommandHandler<EditUserCommand> {
    
    constructor(
        private userFactory: UserFactory,
        private readonly users : UserRepository,
        private readonly verifications : VerificataionRepository,
    ) {}
    
    @TryCatch('editProfile handler Error - ')
    async execute(command: EditUserCommand) : Promise<EditProfileOutput> {
        const { id, email, password } = command;
        let code : string = null;
        // 입력 검증
        if( !email && !password ) {
            throw new Error('수정할 내용이 없습니다.')
        }
        // 수정을 할 계정 조회
        const editUserAccount = await this.users.getUserAccountBy(id);
        if(!editUserAccount.ok) {
            throw new Error( editUserAccount.error );
        }
        // 이메일이 있으면 이메일 수정
        let verification = null;
        if( email ) {
            editUserAccount.user.email = email;
            editUserAccount.user.verified = false;

            await this.verifications.deleteVerification(editUserAccount.user.id);
            verification = await this.verifications.createVerification(editUserAccount.user);
            if( !verification.ok ) {
                throw new Error(  verification.error );
            }

            console.log(verification.code);

            const saveResult = await this.verifications.saveVerification(verification);
            if(!saveResult.ok) {
                await this.verifications.rollbackTransaction();
                throw new Error(saveResult.error);
            }

            const commitResult = await this.verifications.commitTransaction();
            if(!commitResult.ok) {
                await this.verifications.rollbackTransaction();
                throw new Error(  commitResult.error );
            }

            code = (await this.verifications.findOne( { where : {id : verification.id}})).code;
            console.log(code);
            // 이메일 수정 시 메일 발송
        }

        // 비밀번호가 있으면 비번 수정
        if( password ) {
            editUserAccount.user.password = password;
        }
        // 수정 내용 저장
        const updateUserAccount = await this.users.saveUserAccount(editUserAccount.user);
        if( !updateUserAccount.ok ) {
            throw new Error( updateUserAccount.error );
        }

        const userCommitResult = await this.users.commitTransaction();
        if( !userCommitResult.ok ) {
            this.users.rollbackTransaction();
            throw new Error( userCommitResult.error );
        }

        this.userFactory.create(
            updateUserAccount.user.id, updateUserAccount.user.email, updateUserAccount.user.password,
            updateUserAccount.user.role, updateUserAccount.user.verified, 
            updateUserAccount.user.createdAt, updateUserAccount.user.updatedAt, 
            code
        );

        return { ok: true, };
    }
    
}