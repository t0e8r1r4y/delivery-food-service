import { Test } from "@nestjs/testing";
import { UserFactory } from "../../../users/domain/user.factory";
import { UserRepository } from "../../../users/infra/db/repository/user.repository";
import { VerificationService } from "../service/verification.service";
import { EditUserCommand } from "./edit-user.command";
import { EditUserHandler } from "./edit-user.handler";
import { UserEntity, UserRole } from "src/users/infra/db/entities/user.entity";

type MockRepository = Partial< Record< keyof UserRepository, jest.Mock > >;
type MockService = Partial< Record< keyof VerificationService, jest.Mock > >;
type MockFactory = Partial< Record< keyof UserFactory, jest.Mock > >;

describe('editUserCommand', () => {

    const input : EditUserCommand = {
        id: 1,
        email: 'test@naver.com',
        password: '123123123',
    };

    const userEntityBefore : UserEntity = {
        id: 1,
        email: 'gmail@gmail.com',
        password: '23456789',
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
        checkPassword: function (pw: string): Promise<boolean> {
            throw new Error("Not Used");
        }
    }

    const userEntityAfter : UserEntity = {
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
        checkPassword: function (pw: string): Promise<boolean> {
            throw new Error("Not Used");
        }
    }

    let editUserHandler : EditUserHandler;
    let userFactory : MockFactory;
    let userRepository : MockRepository;
    let verification : MockService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                EditUserHandler,
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
                        getUserAccountBy : jest.fn(),
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
                        deleteVerificationByCode : jest.fn(),
                        deleteVerificationByUserId : jest.fn(),
                    }
                }
            ]
        }).compile();

        editUserHandler = module.get(EditUserHandler);
        userFactory = module.get(UserFactory);
        userRepository = module.get(UserRepository);
        verification = module.get(VerificationService);
    }); // end beforeEach

    // part 1
    it('should be failed because there are nothing to edit.',async () => {
        const res = await editUserHandler.execute(new EditUserCommand(input.id));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/EditUserHandler/execute수정할 내용이 없습니다.');
        expect(userRepository.getUserAccountBy).toBeCalledTimes(0);
        expect(verification.deleteVerificationByUserId).toBeCalledTimes(0);
        expect(verification.createAndSaveVerification).toBeCalledTimes(0);
        expect(verification.deleteVerificationByCode).toBeCalledTimes(0);
        expect(userRepository.saveUserAccount).toBeCalledTimes(0);
        expect(userRepository.commitTransaction).toBeCalledTimes(0);
        // expect(userFactory.create).toBeCalledTimes(0);
    });

    // part 2
    it('should return success when edit email and password.', async () => {
        userRepository.getUserAccountBy.mockReturnValue(userEntityBefore);
        verification.deleteVerificationByUserId.mockReturnValue(true);
        verification.createAndSaveVerification.mockReturnValue('code');
        userRepository.saveUserAccount.mockReturnValue(userEntityAfter);
        userRepository.commitTransaction.mockReturnValue(true);
        userFactory.create.mockReturnValue(userEntityAfter);

        const res = await editUserHandler.execute(new EditUserCommand(input.id, input.email, input.password));

        expect(res.ok).toBeTruthy();
        expect(res.error).toBeUndefined();
        expect(userRepository.getUserAccountBy).toBeCalledTimes(1);
        expect(verification.deleteVerificationByUserId).toBeCalledTimes(1);
        expect(verification.createAndSaveVerification).toBeCalledTimes(1);
        expect(verification.deleteVerificationByCode).toBeCalledTimes(0);
        expect(userRepository.saveUserAccount).toBeCalledTimes(1);
        expect(userRepository.commitTransaction).toBeCalledTimes(1);
        // expect(userFactory.create).toBeCalledTimes(1);
    });

    // part 3
    it('should be failed because it fail to delete verification maked before.',async () => {
        userRepository.getUserAccountBy.mockReturnValue(userEntityBefore);
        verification.deleteVerificationByUserId.mockRejectedValue(
            new Error('/Verifications/deleteVerificationByUserId'),
        );

        const res = await editUserHandler.execute(new EditUserCommand(input.id, input.email, input.password));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual( '/EditUserHandler/execute/Verifications/deleteVerificationByUserId');
        expect(userRepository.getUserAccountBy).toBeCalledTimes(1);
        expect(verification.deleteVerificationByUserId).toBeCalledTimes(1);
        expect(verification.createAndSaveVerification).toBeCalledTimes(0);
        expect(verification.deleteVerificationByCode).toBeCalledTimes(0);
        expect(userRepository.saveUserAccount).toBeCalledTimes(0);
        expect(userRepository.commitTransaction).toBeCalledTimes(0);
        // expect(userFactory.create).toBeCalledTimes(0);
    });

    // part 4
    it('should be failed because it fail to make ner verification.',async () => {
        userRepository.getUserAccountBy.mockReturnValue(userEntityBefore);
        verification.deleteVerificationByUserId.mockReturnValue(true);
        verification.createAndSaveVerification.mockReturnValue(null);

        const res = await editUserHandler.execute(new EditUserCommand(input.id, input.email, input.password));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/EditUserHandler/execute/계정 인증코드를 정상 생성하지 못했습니다.');
        expect(userRepository.getUserAccountBy).toBeCalledTimes(1);
        expect(verification.deleteVerificationByUserId).toBeCalledTimes(1);
        expect(verification.createAndSaveVerification).toBeCalledTimes(1);
        expect(verification.deleteVerificationByCode).toBeCalledTimes(1);
        expect(userRepository.saveUserAccount).toBeCalledTimes(0);
        expect(userRepository.commitTransaction).toBeCalledTimes(0);
        // expect(userFactory.create).toBeCalledTimes(0);
    });

    // part 5
    it('should be failed becuase it failt to save user account.',async () => {
        userRepository.getUserAccountBy.mockReturnValue(userEntityBefore);
        verification.deleteVerificationByUserId.mockReturnValue(true);
        verification.createAndSaveVerification.mockReturnValue('code');
        userRepository.saveUserAccount.mockRejectedValue(
            new Error('/save test fail'),
        );

        const res = await editUserHandler.execute(new EditUserCommand(input.id, input.email, input.password));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/EditUserHandler/execute/save test fail');
        expect(userRepository.getUserAccountBy).toBeCalledTimes(1);
        expect(verification.deleteVerificationByUserId).toBeCalledTimes(1);
        expect(verification.createAndSaveVerification).toBeCalledTimes(1);
        expect(verification.deleteVerificationByCode).toBeCalledTimes(0);
        expect(userRepository.saveUserAccount).toBeCalledTimes(1);
        expect(userRepository.commitTransaction).toBeCalledTimes(0);
        // expect(userFactory.create).toBeCalledTimes(0);
    });

});