import { Injectable, NotFoundException } from "@nestjs/common";
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
        // test
    ) {}

    @TryCatch('creatAccount method Fail - ')
    async createAccount( 
        {email, password, role} : CreateAccountInput
    ) : Promise<CreateAccountOutput> {

        // const result = await this.testUser.getUserAccountByEmail(email);
        // console.log(result);
        // const exists = await this.users.findOne({
        //     where : {email},
        // });

        // if(exists) {
        //     throw new Error('이미 계정이 있습니다.')
        // }

        const user = await this.users.save(
            this.users.create({email, password, role}),
        );

        const  verification = await this.Verifications.save(
            this.Verifications.create({user}),
        );

        this.mailService.sendVerificationEmail(user.email, verification.code);

        return { ok: true, }
    }

    @TryCatch('login method Fail - ')
    async login(
        {email, password}: LoginInput
    ): Promise<LoginOutput> {

        const user = await this.users.findOne({
            where : { email },
            select : ['id', 'password']
        });

        if(!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }

        const isCorrectPassword = await user.checkPassword(password);

        if(!isCorrectPassword) {
            throw new Error('비밀번호가 틀렸습니다.');
        }

        const token = this.jwtServie.sign(user.id);

        if(!token) {
            throw new Error('토큰을 발행하지 못하였습니다.')
        }

        return {ok:true, token: token};
    }
 
    // TODO - 이메일 인증처리 로직 정리가 필요함.
    @TryCatch('editProfile method Fail - ')
    async editProfile( 
        userId : number, { email, password }: EditProfileInput
    ) : Promise<EditProfileOutput>  {

        if( !email && !password) {
            throw new Error('수정할 내용이 없습니다.');
        }

        const user = await this.users.findOne({
            where : {
                id : userId,
            }
        });

        if( !user ) {
            throw new Error('수정할 사용자를 찾지 못하였습니다.');
        }

        if(email) {
            user.email = email;
            user.verified = false;
            await this.Verifications.delete({
                user: {
                    id: user.id,
                }
            });
            const verification = await this.Verifications.save(
                this.Verifications.create({user}),
            );
            this.mailService.sendVerificationEmail(user.email, verification.code);
        }

        if(password) {
            user.password = password;
        }

        await this.users.save(user);

        return { ok: true, };
    }

    @TryCatch('findById method Fail - ')
    async findById( 
        id : number 
    ) : Promise<UserProfileOutput> {
        const user = await this.users.findOne({
            where : {
                id: id,
            }
        })

        if(!user) {
            throw new Error(`${id}의 사용자를 찾을 수 없습니다.`);
        }

        return { ok: true, user: user };
    }

    @TryCatch('verifyEmail method Fail - ')
    async verifyEmail(
        code:string
    ) : Promise<VerifyEmailOutput> {
        const verification = await this.Verifications.findOne({
            where: {code},
            relations: ['user']
        });

        if(!verification) {
            throw new NotFoundException('인증값을 찾지 못했습니다.');
        }
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.Verifications.delete(verification.id);

        return { ok: true };
    }
}