import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-acoount.dto";
import { LoginInput, LoginOutput } from "../users/dtos/login.dto";
import { JwtService } from "../jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";
import { VerifyEmailOutput } from "./dtos/verify-email.dto";
import { UserProfileOutput } from "./dtos/user-profile.dto";
import { MailService } from "../mail/mail.service";
import { TryCatch } from "../common/trycatch.decorator";
import { UsersResolver } from "./users.resolver";
import { UserRepository } from "./repository/user.repository";
import { VerificataionRepository } from "./repository/verification.repository";

@Injectable()
export class UsersService {
    constructor(
        private readonly jwtServie: JwtService,
        private readonly mailService: MailService,
        private readonly users : UserRepository,
        private readonly verifications : VerificataionRepository,
    ) {}

    @TryCatch('creatAccount method Fail - ')
    async createAccount( 
        {email, password, role} : CreateAccountInput
    ) : Promise<CreateAccountOutput> {

        const result = await this.users.beUserAccountExistByEmail(email);
        
        if( !result.ok ) {
            throw new Error( result.error );
        }

        const userAccount = await this.users.createAccountAndSave( {email, password, role} );
        
        if( !userAccount.ok ) {
            throw new Error( userAccount.error );
        }

        const verification = await this.verifications.createAndSaveVerification(userAccount.user);

        if( !verification.ok ) {
            throw new Error( verification.error );
        }

        this.mailService.sendVerificationEmail(userAccount.user.email, verification.verification.code );

        return { ok: true, }
    }

    @TryCatch('login method Fail - ')
    async login(
        {email, password}: LoginInput
    ): Promise<LoginOutput> {
        // 사용자 계정을 조회
        const userAccount = await this.users.getUserAccountByEmail(email);
        if( !userAccount.ok ) {
            throw new Error(userAccount.error);
        }
        // 비밀번호 검증
        const isPasswordCorrect = await userAccount.user.checkPassword(password);
        if( !isPasswordCorrect ) {
            throw new Error('비밀번호가 틀렸습니다.');
        }
        // 토큰 발행
        const token = this.jwtServie.sign(userAccount.user.id);
        if(!token) {
            throw new Error('토큰을 발행하지 못하였습니다.')
        }

        return { ok:true, token: token };
    }
 
    // TODO - 이메일 인증처리 로직 정리가 필요함.
    @TryCatch('editProfile method Fail - ')
    async editProfile( 
        userId : number, { email, password }: EditProfileInput
    ) : Promise<EditProfileOutput>  {

        if( !email && !password ) {
            throw new Error('수정할 내용이 없습니다.');
        }

        const editUserAccount = await this.users.getUserAccountById(userId);

        if(!editUserAccount.ok) {
            throw new Error( editUserAccount.error) ;
        }

        if(email) {
            editUserAccount.user.email = email;
            editUserAccount.user.verified = false;

            await this.verifications.deleteVerification(editUserAccount.user.id);

            const verification = await this.verifications.createAndSaveVerification(editUserAccount.user);

            if(!verification.ok) {
                throw new Error( verification.error );
            }

            this.mailService.sendVerificationEmail(editUserAccount.user.email, verification.verification.code);
        }

        if(password) {
            editUserAccount.user.password = password;
        }

        const updatedUserAccount = await this.users.saveUserAccount(editUserAccount.user);

        if( !updatedUserAccount.ok ) {
            throw new Error( updatedUserAccount.error) ;
        }

        return { ok: true, };
    }

    @TryCatch('findById method Fail - ')
    async findById( 
        id : number 
    ) : Promise<UserProfileOutput> {

        const userAccount = await this.users.getUserAccountById(id);
        
        if(!userAccount.ok) {
            throw new Error(userAccount.error);
        }

        return { ok: true, user: userAccount.user };
    }

    @TryCatch('verifyEmail method Fail - ')
    async verifyEmail(
        code : string
    ) : Promise<VerifyEmailOutput> {
        const verification = await this.verifications.getVerificationByCode(code);

        if(!verification.ok) {
            throw new Error(verification.error);
        }

        verification.verification.user.verified = true;
        
        const editUserAccount = await this.users.saveUserAccount(verification.verification.user);

        if(!editUserAccount.ok) {
            throw new Error(editUserAccount.error);
        }

        await this.verifications.deleteVerification(verification.verification.id);

        return { ok: true };
    }


}