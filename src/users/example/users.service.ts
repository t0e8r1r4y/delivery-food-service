import { Injectable } from "@nestjs/common";
import { CreateAccountInput, CreateAccountOutput } from "../interface/dtos/create-acoount.dto";
import { LoginInput, LoginOutput } from "../interface/dtos/login.dto";
import { JwtService } from "../../jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "../interface/dtos/edit-profile.dto";
import { VerifyEmailOutput } from "../interface/dtos/verify-email.dto";
import { UserProfileOutput } from "../interface/dtos/user-profile.dto";
import { MailService } from "../../mail/mail.service";
import { TryCatch } from "../../common/method-decorator/trycatch.decorator";
import { UserRepository } from "../infra/db/repository/user.repository";
import { VerificataionRepository } from "../infra/db/repository/verification.repository";


/**
 * Service에 구현된 로직을 Clean Architecture로 리팩토링하면서 해당 로직을 차후에 확인하고자 아래 내용을 남겨둡니다.
 * 이와 관련하여 user.service.spec.ts 파일도 함께 남겨둡니다.
 */

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
        // 계정 존재 여부 확인
        // const result = await this.users.beUserAccountExistByEmail(email);
        // if( !result.ok ) {
        //     throw new Error( result.error );
        // }
        // // 계정 생성
        // const userAccount = await this.users.createAccountAndSave( {email, password, role} );
        // if( !userAccount.ok ) {
        //     throw new Error( userAccount.error );
        // }
        // // 계정 인증 생성
        // const verification = await this.verifications.createAndSaveVerification(userAccount.user);
        // if( !verification.ok ) {
        //     throw new Error( verification.error );
        // }
        // // 인증 메일 발송
        // this.mailService.sendVerificationEmail(userAccount.user.email, verification.verification.code );

        return { ok: true, }
    }

    @TryCatch('login method Fail - ')
    async login(
        {email, password}: LoginInput
    ): Promise<LoginOutput> {
        // 사용자 계정을 조회
        // const userAccount = await this.users.getUserAccountByEmail(email);
        // if( !userAccount.ok ) {
        //     throw new Error(userAccount.error);
        // }
        // // 비밀번호 검증
        // const isPasswordCorrect = await userAccount.user.checkPassword(password);
        // if( !isPasswordCorrect ) {
        //     throw new Error('비밀번호가 틀렸습니다.');
        // }
        // // 토큰 발행
        // const token = this.jwtServie.sign(userAccount.user.id);
        // if(!token) {
        //     throw new Error('토큰을 발행하지 못하였습니다.')
        // }

        return { ok:true, token: null };
    }
 
    @TryCatch('editProfile method Fail - ')
    async editProfile( 
        userId : number, { email, password }: EditProfileInput
    ) : Promise<EditProfileOutput>  {
        // 입력 검증
        // if( !email && !password ) {
        //     throw new Error('수정할 내용이 없습니다.');
        // }
        // // 수정을 할 계정 조회
        // const editUserAccount = await this.users.getUserAccountById(userId);
        // if(!editUserAccount.ok) {
        //     throw new Error( editUserAccount.error ) ;
        // }
        // // 이메일이 있으면 이메일 수정
        // if(email) {
        //     editUserAccount.user.email = email;
        //     editUserAccount.user.verified = false;

        //     await this.verifications.deleteVerification(editUserAccount.user.id);

        //     const verification = await this.verifications.createAndSaveVerification(editUserAccount.user);

        //     if(!verification.ok) {
        //         throw new Error( verification.error );
        //     }

        //     this.mailService.sendVerificationEmail(editUserAccount.user.email, verification.verification.code);
        // }
        // // 비밀번호가 있으면 비번 수정
        // if(password) {
        //     editUserAccount.user.password = password;
        // }
        // // 수정 내용 저장
        // const updatedUserAccount = await this.users.saveUserAccount(editUserAccount.user);
        // if( !updatedUserAccount.ok ) {
        //     throw new Error( updatedUserAccount.error) ;
        // }

        return { ok: true, };
    }

    @TryCatch('findById method Fail - ')
    async findById( 
        id : number 
    ) : Promise<UserProfileOutput> {
        // 사용자 계정 조회
        // const userAccount = await this.users.getUserAccountBy(id);
        // if(!userAccount.ok) {
        //     throw new Error(userAccount.error);
        // }

        return { ok: true, user: null };
    }

    @TryCatch('verifyEmail method Fail - ')
    async verifyEmail(
        code : string
    ) : Promise<VerifyEmailOutput> {
        // 인증코드 조회
        // const verification = await this.verifications.getVerificationByCode(code);
        // if(!verification.ok) {
        //     throw new Error(verification.error);
        // }
        // // 인증 완료 정보 수정
        // verification.verification.user.verified = true;
        // // 인증 완료 정보 수정 저장
        // const editUserAccount = await this.users.saveUserAccount(verification.verification.user);
        // if(!editUserAccount.ok) {
        //     throw new Error(editUserAccount.error);
        // }
        // // 해당 인증 삭제
        // await this.verifications.deleteVerification(verification.verification.id);

        return { ok: true };
    }


}