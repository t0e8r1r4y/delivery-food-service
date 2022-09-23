import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginOutput } from "../../../users/interface/dtos/login.dto";
import { UserRepository } from "../../../users/infra/db/repository/user.repository";
import { LoginUserCommand } from "./login-user.command";
import { JwtService } from "../../../jwt/jwt.service";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";

@Injectable()
@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
    
    constructor(
        private readonly users : UserRepository,
        private readonly jwtServie: JwtService, // TODO - 외부서비스이므로 interface 영역 혹은 Infra 영역에 정의
    ) {}
    
    @TryCatchService('/LoginUserHandler/execute')
    async execute(command: LoginUserCommand): Promise<LoginOutput> {
        const { email, password } = command;
        // 계정 확인
        const userAccount = await this.users.getUserAccountBy(email);
        // 비밀번호 검증
        const isPasswordCorrect = await userAccount.checkPassword(password);
        if( !isPasswordCorrect ) {
            throw new Error('/비밀번호가 틀렸습니다.');
        }
        // 토큰 발행
        const token = this.jwtServie.sign(userAccount.id);
        if(!token) {
            throw new Error('/토큰을 발행하지 못하였습니다.')
        }
        return { ok:true, token: token };
    }

}