import { Test } from "@nestjs/testing";
import { UserEntity, UserRole } from "src/users/infra/db/entities/user.entity";
import { UserFactory } from "../../../users/domain/user.factory";
import { UserRepository } from "../../../users/infra/db/repository/user.repository";
import { VerificationService } from "../service/verification.service";
import { CreateUserCommand } from "./create-user.command";
import { CreateUserHandler } from "./create-user.handler";


type MockRepository = Partial< Record< keyof UserRepository, jest.Mock > >;
type MockService = Partial< Record< keyof VerificationService, jest.Mock > >;
type MockFactory = Partial< Record< keyof UserFactory, jest.Mock > >;

describe('CreateUserHandler', () => {

    const input : CreateUserCommand = {
        email : 'test@naver.com',
        password : '12312312312',
        role : UserRole.Client,
    };

    const userEntity : UserEntity = {
        id: 1,
        email: input.email,
        password: input.password,
        role: input.role,
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
        checkPassword: function (pw: string): Promise<boolean> {
            throw new Error("Not Used");
        }
    }

    let createUserHandler : CreateUserHandler;
    let userFactory : MockFactory;
    let userRepository : MockRepository;
    let verification : MockService;

    // test 함수 구현 시, 자꾸 실수하는 부분
    // beforeEach랑 beforeAll이랑 정확하게 구분해서 사용할 것!
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                CreateUserHandler,
                {
                    provide: UserFactory,
                    useValue: {
                        create: jest.fn(),
                    },
                },
                {
                    provide: UserRepository,
                    useValue: {
                        beUserAccountExistByEmail : jest.fn(),
                        createUserAccount : jest.fn(),
                        saveUserAccount : jest.fn(),
                        createAndSaveVerification : jest.fn(),
                        rollbackTransaction : jest.fn(),
                        commitTransaction : jest.fn(),
                    }
                },
                {
                    provide: VerificationService,
                    useValue: {
                        createAndSaveVerification : jest.fn(),
                        deleteVerificationByCode : jest.fn()
                    }
                }
            ],
        }).compile();

        createUserHandler = module.get(CreateUserHandler);
        userFactory = module.get(UserFactory);
        userRepository = module.get(UserRepository);
        verification = module.get(VerificationService);

    }); // end beforeEach

    // test part 1
    it('should create user account by executing CreateUserCommand',async () => {
        userRepository.beUserAccountExistByEmail.mockReturnValue(true);
        userRepository.createUserAccount.mockReturnValue(userEntity);
        userRepository.saveUserAccount.mockReturnValue(userEntity);
        verification.createAndSaveVerification.mockReturnValue('test verificaion code');
        userRepository.commitTransaction.mockReturnValue(true);
        userFactory.create.mockReturnValue(userEntity);

        const res = await createUserHandler.execute(new CreateUserCommand(input.email, input.password, input.role));

        expect(res.ok).toBeTruthy();
        // 아래 기대 값이 null이 아니라 undefined로 출력되어 create-user.handler.ts file에서 return 값을 수정했습니다.
        expect(res.error).toBeNull();
        expect(userRepository.beUserAccountExistByEmail).toBeCalledTimes(1);
        expect(userRepository.createUserAccount).toBeCalledTimes(1);
        expect(userRepository.saveUserAccount).toBeCalledTimes(1);
        expect(userRepository.rollbackTransaction).toBeCalledTimes(0);
        expect(verification.deleteVerificationByCode).toBeCalledTimes(0);
        expect(userRepository.commitTransaction).toBeCalledTimes(1);
        // expect(userFactory.create).toBeCalledTimes(1);        
    })
    
    // test part 2
    it('should return error because email is already existed.',async () => {

        userRepository.beUserAccountExistByEmail.mockRejectedValue(
            new Error('/UserRepository/beUserAccountExistByEmail/이미 가입 된 계정입니다.'),
        );

        const res = await createUserHandler.execute(new CreateUserCommand(input.email, input.password, input.role));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/CreateUserHandler/execute/UserRepository/beUserAccountExistByEmail/이미 가입 된 계정입니다.');
        expect(userRepository.beUserAccountExistByEmail).toBeCalledTimes(1);
        expect(userRepository.createUserAccount).toBeCalledTimes(0);
        expect(userRepository.saveUserAccount).toBeCalledTimes(0);
        expect(userRepository.rollbackTransaction).toBeCalledTimes(0);
        expect(verification.deleteVerificationByCode).toBeCalledTimes(0);
        expect(userRepository.commitTransaction).toBeCalledTimes(0);
        // expect(userFactory.create).toBeCalledTimes(0);
    });

    // test part 3
    it('should return error becuase it should fail to create user',async () => {
        userRepository.beUserAccountExistByEmail.mockReturnValue(true);
        userRepository.createUserAccount.mockRejectedValue(
            new Error('/UserRepository/createUserAccount/계정을 생성 할 수 없습니다.'),
        );

        const res = await createUserHandler.execute(new CreateUserCommand(input.email, input.password, input.role));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/CreateUserHandler/execute/UserRepository/createUserAccount/계정을 생성 할 수 없습니다.');
        expect(userRepository.beUserAccountExistByEmail).toBeCalledTimes(1);
        expect(userRepository.createUserAccount).toBeCalledTimes(1);
        expect(userRepository.saveUserAccount).toBeCalledTimes(0);
        expect(userRepository.rollbackTransaction).toBeCalledTimes(0);
        expect(verification.deleteVerificationByCode).toBeCalledTimes(0);
        expect(userRepository.commitTransaction).toBeCalledTimes(0);
        // expect(userFactory.create).toBeCalledTimes(0);
    });

    // test part 4
    it('should return error becuase it should fail to save user in persistence context', async () => {
        userRepository.beUserAccountExistByEmail.mockReturnValue(true);
        userRepository.createUserAccount.mockReturnValue(userEntity);
        userRepository.saveUserAccount.mockRejectedValue(
            new Error('/UserRepository/saveUserAccount/save fail'),
        );

        const res = await createUserHandler.execute(new CreateUserCommand(input.email, input.password, input.role));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/CreateUserHandler/execute/UserRepository/saveUserAccount/save fail');
        expect(userRepository.beUserAccountExistByEmail).toBeCalledTimes(1);
        expect(userRepository.createUserAccount).toBeCalledTimes(1);
        expect(userRepository.saveUserAccount).toBeCalledTimes(1);
        expect(userRepository.rollbackTransaction).toBeCalledTimes(0);
        expect(verification.deleteVerificationByCode).toBeCalledTimes(0);
        expect(userRepository.commitTransaction).toBeCalledTimes(0);
        // expect(userFactory.create).toBeCalledTimes(0);

    });

    // test part 5
    it('should return error becuase of fail to create verification',async () => {
        userRepository.beUserAccountExistByEmail.mockReturnValue(true);
        userRepository.createUserAccount.mockReturnValue(userEntity);
        userRepository.saveUserAccount.mockReturnValue(userEntity);
        verification.createAndSaveVerification.mockReturnValue(null);

        const res = await createUserHandler.execute(new CreateUserCommand(input.email, input.password, input.role));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/CreateUserHandler/execute/계정 인증코드를 정상 생성하지 못했습니다.');
        expect(userRepository.beUserAccountExistByEmail).toBeCalledTimes(1);
        expect(userRepository.createUserAccount).toBeCalledTimes(1);
        expect(userRepository.saveUserAccount).toBeCalledTimes(1);
        expect(userRepository.rollbackTransaction).toBeCalledTimes(1);
        expect(verification.deleteVerificationByCode).toBeCalledTimes(1);
        expect(userRepository.commitTransaction).toBeCalledTimes(0);
        // expect(userFactory.create).toBeCalledTimes(0);

    });

}); // end describe