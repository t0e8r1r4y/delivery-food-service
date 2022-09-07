import { Injectable } from "@nestjs/common";
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

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly Verifications: Repository<Verification>,
        private readonly jwtServie: JwtService,
        private readonly mailService: MailService,
    ) {}

    @TryCatch('creatAccount method Fail - ')
    async createAccount( 
        {email, password, role} : CreateAccountInput
    ) : Promise<CreateAccountOutput> {

        const exists = await this.users.findOne({
            where : {email},
        });

        if(exists) {
            throw new Error('이미 계정이 있습니다.')
        }

        const user = await this.users.save(
            this.users.create({email, password, role}),
        );

        const  verification = await this.Verifications.save(
            this.Verifications.create({user}),
        );

        this.mailService.sendVerificationEmail(user.email, verification.code);

        return { ok: true, }
    }

    // async createAccount( 
    //     {email, password, role} : CreateAccountInput
    // ) : Promise<CreateAccountOutput> {
    //     try {
    //         const exists = await this.users.findOne( {where:{email}} );

    //         if(exists) { // 이미 존재
    //             return {ok: false, error: '이미 존재하는 사용자입니다.'};
    //         }

    //         const user = await this.users.save(
    //             this.users.create({email, password, role}),
    //         );

    //         const verification = await this.Verifications.save(
    //             this.Verifications.create({
    //                 user,
    //             })
    //         );

    //         this.mailService.sendVerificationEmail(user.email, verification.code);

    //         return { ok: true };
    //     } catch (error) {
    //         console.log(error);
    //         return { ok: false, error: "계정을 생성할 수 없습니다." };
    //     }
    // }

    async login(
        {email, password}: LoginInput
    ): Promise<LoginOutput> {
        try {
            const user = await this.users.findOne( 
                { 
                    where:{email}, 
                    select:["id","password"] // 처리로직에 필요한 부분을 select 한다.
                }
            );

            if(!user) {
                return { ok: false, error: '사용자를 찾을 수 없습니다.'};
            }

            const pwCorrect = await user.checkPassword(password);

            if(!pwCorrect) {
                return {ok: false, error: '비밀번호가 틀렸습니다.'};
            }

            const token = this.jwtServie.sign(user.id);

            return {ok: true, token: token};
        } catch (error) {
            console.log(error);
            return { ok: false, error: '로그인을 할 수 없습니다.' };
        }
    }

    
    
    // userId comming from token
    // 특정 값만 수정하고 싶은데 {email, password} 이런식으로 코드를 작성하면 둘다 들어가야되서 하나는 undefined가 뜨게된다.
    // not null constraint error
    async editProfile( 
        userId:number, {email, password}: EditProfileInput
    ) : Promise<EditProfileOutput>  {
        try {
            // update method는 DB에 쿼리만 보낼 뿐! -> save method를 써야한다.
            // return this.users.update(userId, {... editProfileInput});
            // save method는 이미 있는 메서드는 업데이트 한다.
            const id : number = userId; // findOne에서는 entity에 포함된 컬럼과 동일한 명칭의 변수로 조회가 가능하다.
            const user = await this.users.findOne({where:{id}});
            if(email) {
                user.email = email;
                user.verified = false;
                await this.Verifications.delete({user: {id: user.id}});
                const verification = await this.Verifications.save(this.Verifications.create({user}));
                this.mailService.sendVerificationEmail(user.email, verification.code);
            }
            if(password) {
                user.password = password;
            }
            await this.users.save(user);
            return { ok: true };
        } catch (error) {
            return { ok:false, error: '프로파일 업데이트가 불가능합니다.' };
        }
    }

    // MAT userProfile in resolver
    async findById( id : number ) : Promise<UserProfileOutput> {
        try {
            const user = await this.users.findOne( {where:{id}} );
            if(user){
                return { ok: true, user: user };
            }
            throw new Error(); // Todo - 수정이 필요한 부분
        } catch (error) {
            console.log(error);
            return { ok: false, error: '사용자를 찾지 못했습니다.' };
        }
    }

    async verifyEmail(code:string) : Promise<VerifyEmailOutput> {
        try {
            const verification = await this.Verifications.findOne(
                { where: {code}, relations: ['user'] } // findOne Method는 하나의 인자만 받는다. {} 사용 주의
            );

            if(verification){
                verification.user.verified = true;
                await this.users.save(verification.user);
                await this.Verifications.delete(verification.id);
                return { ok: true };
            }
            
            return { ok: false, error: '인증값을 찾지 못했습니다.' };

        } catch (error) {
            console.log(error);
            return { ok: false, error: '인증에 실패했습니다.' };
        }
    }
}