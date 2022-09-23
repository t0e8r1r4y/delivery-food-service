import { Test } from "@nestjs/testing";
import { UserEntity, UserRole } from "../../../users/infra/db/entities/user.entity";
import { VerificationEntity } from "../../../users/infra/db/entities/verification.entity";
import { UserRepository } from "../../../users/infra/db/repository/user.repository";
import { VerificationService } from "../service/verification.service";
import { VerifyEmailCommand } from "./verify-email.command";
import { VerifyEmailHandler } from "./verify-email.handler";

type MockRepository = Partial< Record< keyof UserRepository, jest.Mock > >;
type MockService = Partial< Record< keyof VerificationService, jest.Mock > >;

const userEntityAfter : UserEntity = {
    id: 1,
    email: 'test@naver.com',
    password: '123123123',
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

const verificationMock : VerificationEntity = {
    code: "1a77a26b-0b96-4735-8cc2-ed71129a9534",
    user: userEntityAfter,
    createCode: function (): void {
        return;
    },
    id: 1,
    createdAt: new Date('2022-09-02 11:22:22.891575'),
    updatedAt: new Date('2022-09-02 11:22:22.891575'),
};

describe('verifyEmailHandler', () => {

    let verifyEmailHandler : VerifyEmailHandler;
    let userRepository : MockRepository;
    let verification : MockService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                VerifyEmailHandler,
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
                        getVerificationByCode : jest.fn(),
                    }
                }
            ]
        }).compile();

        verifyEmailHandler = module.get(VerifyEmailHandler);
        userRepository = module.get(UserRepository);
        verification = module.get(VerificationService);
    });

    // test part 1
    it('should be return success.',async () => {
        verification.getVerificationByCode.mockReturnValue(verificationMock);
        userRepository.saveUserAccount.mockReturnValue(userEntityAfter);
        verification.deleteVerificationByUserId.mockReturnValue(true);

        const res = await verifyEmailHandler.execute(new VerifyEmailCommand(verificationMock.code));

        expect(res.ok).toBeTruthy();
        expect(res.error).toBeUndefined();
        expect(verification.getVerificationByCode).toBeCalledTimes(1);
        expect(userRepository.saveUserAccount).toBeCalledTimes(1);
        expect(userRepository.rollbackTransaction).toBeCalledTimes(0);
        expect(verification.deleteVerificationByUserId).toBeCalledTimes(1);
        expect(userRepository.commitTransaction).toBeCalledTimes(1);

    });

    // test part 2
    it('should be return fail, becuase it should fail to get verification by user id.',async () => {
        verification.getVerificationByCode.mockRejectedValue(
            new Error('/Verifications/getVerificationByUserId'),
        )

        const res = await verifyEmailHandler.execute(new VerifyEmailCommand(verificationMock.code));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/VerifyEmailHandler/execute/Verifications/getVerificationByUserId');
        expect(verification.getVerificationByCode).toBeCalledTimes(1);
        expect(userRepository.saveUserAccount).toBeCalledTimes(0);
        expect(userRepository.rollbackTransaction).toBeCalledTimes(0);
        expect(verification.deleteVerificationByUserId).toBeCalledTimes(0);
        expect(userRepository.commitTransaction).toBeCalledTimes(0);

    });

    // test part 3
    it('should be return fail, because it should fail to save user account.',async () => {
        verification.getVerificationByCode.mockReturnValue(verificationMock);
        userRepository.saveUserAccount.mockRejectedValue(
            new Error('/UserRepository/saveUserAccount'),
        )

        const res = await verifyEmailHandler.execute(new VerifyEmailCommand(verificationMock.code));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/VerifyEmailHandler/execute/UserRepository/saveUserAccount');
        expect(verification.getVerificationByCode).toBeCalledTimes(1);
        expect(userRepository.saveUserAccount).toBeCalledTimes(1);
        expect(userRepository.rollbackTransaction).toBeCalledTimes(0);
        expect(verification.deleteVerificationByUserId).toBeCalledTimes(0);
        expect(userRepository.commitTransaction).toBeCalledTimes(0);

    });

    // test part 4
    it('should be return fail, because it should fail to delete verification by user id.',async () => {
        verification.getVerificationByCode.mockReturnValue(verificationMock);
        userRepository.saveUserAccount.mockReturnValue(userEntityAfter);
        verification.deleteVerificationByUserId.mockRejectedValue(
            new Error('/Verifications/deleteVerificationByUserId'),
        )

        const res = await verifyEmailHandler.execute(new VerifyEmailCommand(verificationMock.code));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/VerifyEmailHandler/execute/Verifications/deleteVerificationByUserId');
        expect(verification.getVerificationByCode).toBeCalledTimes(1);
        expect(userRepository.saveUserAccount).toBeCalledTimes(1);
        expect(userRepository.rollbackTransaction).toBeCalledTimes(0);
        expect(verification.deleteVerificationByUserId).toBeCalledTimes(1);
        expect(userRepository.commitTransaction).toBeCalledTimes(0);

    });

}); // end describe