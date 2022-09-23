import { LoginUserCommand } from "./login-user.command";
import { UserRepository } from "../../../users/infra/db/repository/user.repository";
import { JwtService } from "../../../jwt/jwt.service";
import { Test } from "@nestjs/testing";
import { LoginUserHandler } from "./login-user.handler";
import { UserEntity, UserRole } from "src/users/infra/db/entities/user.entity";

type MockRepository = Partial< Record< keyof UserRepository, jest.Mock > >;
type MockService = Partial< Record< keyof JwtService, jest.Mock > >;

describe('loginUserCommand', () => {

    const input : LoginUserCommand = {
        email : 'test@naver.com',
        password : '12312312312',
    };

    const userEntity : UserEntity = {
        id: 1,
        email: input.email,
        password: input.password,
        role: UserRole.Client,
        verified: false,
        createdAt: new Date('2022-09-02 11:22:22.891575'),
        updatedAt: new Date('2022-09-02 11:22:22.891575'),
        restaurants: [],
        orders: [],
        payments: [],
        riders: [],
        hassPassword: function (): Promise<void> {
            throw new Error("Not Used");
        },
        checkPassword: async function (pw: string): Promise<boolean> {
            return true;
        }
    }

    const userEntityPassWordWrong : UserEntity = {
        id: 1,
        email: input.email,
        password: input.password,
        role: UserRole.Client,
        verified: false,
        createdAt: new Date('2022-09-02 11:22:22.891575'),
        updatedAt: new Date('2022-09-02 11:22:22.891575'),
        restaurants: [],
        orders: [],
        payments: [],
        riders: [],
        hassPassword: function (): Promise<void> {
            throw new Error("Not Used");
        },
        checkPassword: async function (pw: string): Promise<boolean> {
            return false;
        }
    }

    let loginUserHandler : LoginUserHandler;
    let userRepository : MockRepository;
    let jwtService : MockService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                LoginUserHandler,
                {
                    provide: UserRepository,
                    useValue: {
                        beUserAccountExistByEmail : jest.fn(),
                        getUserAccountBy : jest.fn(),
                        createUserAccount : jest.fn(),
                        saveUserAccount : jest.fn(),
                        createAndSaveVerification : jest.fn(),
                        rollbackTransaction : jest.fn(),
                        commitTransaction : jest.fn(),
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign : jest.fn(),
                        verify : jest.fn(),
                    }
                }

            ],
        }).compile();

        loginUserHandler = module.get(LoginUserHandler);
        userRepository = module.get(UserRepository);
        jwtService = module.get(JwtService);

    }); // end beforeEach

    // test part 1.
    it('should be succecss and return value of true and token.', async () => {
        userRepository.getUserAccountBy.mockReturnValue(userEntity);
        jwtService.sign.mockReturnValue('test-token');

        const res = await loginUserHandler.execute(new LoginUserCommand(input.email, input.password));

        expect(res.ok).toBeTruthy();
        expect(res.error).toBeUndefined();
        expect(res.token).toEqual('test-token');
        expect(userRepository.getUserAccountBy).toBeCalledTimes(1);
        expect(jwtService.sign).toBeCalledTimes(1);

    });

    // test part 2.
    it('should be return false, because of not found user account.', async () => {
        userRepository.getUserAccountBy.mockRejectedValue(
            new Error(),
        )

        const res = await loginUserHandler.execute(new LoginUserCommand(input.email, input.password));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/LoginUserHandler/execute');
        expect(res.token).toBeUndefined();
        expect(userRepository.getUserAccountBy).toBeCalledTimes(1);
        expect(jwtService.sign).toBeCalledTimes(0);

    });

    // test part 3.
    it('should be return false, because password is wrong.',async () => {
        userRepository.getUserAccountBy.mockReturnValue(userEntityPassWordWrong);

        const res = await loginUserHandler.execute(new LoginUserCommand(input.email, input.password));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/LoginUserHandler/execute/비밀번호가 틀렸습니다.');
        expect(res.token).toBeUndefined();
        expect(userRepository.getUserAccountBy).toBeCalledTimes(1);
        expect(jwtService.sign).toBeCalledTimes(0);
    });

    // test part 4.
    it('should be return false, because it fail to issue a token',async () => {
        userRepository.getUserAccountBy.mockReturnValue(userEntity);
        jwtService.sign.mockReturnValue(null);

        const res = await loginUserHandler.execute(new LoginUserCommand(input.email, input.password));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/LoginUserHandler/execute/토큰을 발행하지 못하였습니다.');
        expect(res.token).toBeUndefined();
        expect(userRepository.getUserAccountBy).toBeCalledTimes(1);
        expect(jwtService.sign).toBeCalledTimes(1);
    });

});