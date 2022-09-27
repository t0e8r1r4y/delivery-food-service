import { Test } from "@nestjs/testing";
import { VerificataionRepository } from "../../../users/infra/db/repository/verification.repository";
import { UserEntity, UserRole } from "../../../users/infra/db/entities/user.entity";
import { VerificationEntity } from "../../../users/infra/db/entities/verification.entity";
import { VerificationService } from "./verification.service";

type MockRepository = Partial< Record< keyof VerificataionRepository, jest.Mock > >;

const userEntity : UserEntity = {
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
    user: userEntity,
    createCode: function (): void {
        return;
    },
    id: 1,
    createdAt: new Date('2022-09-02 11:22:22.891575'),
    updatedAt: new Date('2022-09-02 11:22:22.891575'),
};

describe('verificaionService', () => {

    let verifyService : VerificationService;
    let verificationRepository : MockRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                VerificationService,
                {
                    provide : VerificataionRepository,
                    useValue: {
                        getVerificationCodeById : jest.fn(),
                        createVerification : jest.fn(),
                        saveVerification : jest.fn(),
                        commitTransactions : jest.fn(),
                        rollbackTransactions : jest.fn(),
                        deleteVerification : jest.fn(),
                        deleteVerificationById : jest.fn(),
                        getVerificationByCode : jest.fn(),
                        findOne : jest.fn(),
                    }
                }
            ]
        }).compile();

        verifyService = module.get(VerificationService);
        verificationRepository = module.get(VerificataionRepository);
    }) // end beforeEach

    /**
     * Test for createAndSaveVerification method.
     */
    it('createAndSaveVerification method should return success',async () => {
      verificationRepository.createVerification.mockReturnValue(verificationMock);
      verificationRepository.saveVerification.mockReturnValue(verificationMock);

      const res = await verifyService.createAndSaveVerification(userEntity);

      expect(res).toEqual(verificationMock.code);
      expect(verificationRepository.createVerification).toBeCalledTimes(1);
      expect(verificationRepository.saveVerification).toBeCalledTimes(1);
      expect(verificationRepository.commitTransactions).toBeCalledTimes(1);
    });

    it('createAndSaveVerification method should return fail, because it should fail to create verificaion instance.',async () => {
        verificationRepository.createVerification.mockRejectedValue(
            new Error('/test'),
        )
  
        const res = await verifyService.createAndSaveVerification(userEntity);
  
        expect(res.toString()).toEqual('Error: /Verifications/createAndSaveVerification/test');
        expect(verificationRepository.createVerification).toBeCalledTimes(1);
        expect(verificationRepository.saveVerification).toBeCalledTimes(0);
        expect(verificationRepository.commitTransactions).toBeCalledTimes(0);
      });

      it('createAndSaveVerification method should return fail, because it should fail to save verificaion instance.',async () => {
        verificationRepository.createVerification.mockReturnValue(verificationMock);
        verificationRepository.saveVerification.mockRejectedValue(
            new Error('/test2'),
        )
  
        const res = await verifyService.createAndSaveVerification(userEntity);
  
        expect(res.toString()).toEqual('Error: /Verifications/createAndSaveVerification/test2');
        expect(verificationRepository.createVerification).toBeCalledTimes(1);
        expect(verificationRepository.saveVerification).toBeCalledTimes(1);
        expect(verificationRepository.commitTransactions).toBeCalledTimes(0);
      });

      /**
       * Test for deleteVerificationByCode method
       */
      it('deleteVerificaionByCod method should return success',async () => {
        verificationRepository.getVerificationByCode.mockReturnValue(verificationMock);
        verificationRepository.deleteVerification.mockReturnValue(true);

        const res = await verifyService.deleteVerificationByCode(verificationMock.code);

        expect(res).toBeTruthy();
        expect(verificationRepository.getVerificationByCode).toBeCalledTimes(1);
        expect(verificationRepository.deleteVerification).toBeCalledTimes(1);
      });

      it('deleteVerificaionByCod method should return fail, because it should fail to get verification',async () => {
        verificationRepository.getVerificationByCode.mockRejectedValue(
            new Error('/Verifications/deleteVerification/VerificataionRepository/getVerificationByCode/인증값을 찾지 못했습니다.'),
        )

        const res = await verifyService.deleteVerificationByCode(verificationMock.code);

        expect(res.toString()).toEqual('Error: /Verifications/deleteVerification/Verifications/deleteVerification/VerificataionRepository/getVerificationByCode/인증값을 찾지 못했습니다.');
        expect(verificationRepository.getVerificationByCode).toBeCalledTimes(1);
        expect(verificationRepository.deleteVerification).toBeCalledTimes(0);
      });

      it('deleteVerificaionByCod method should return fail, because it should fail to delete verification',async () => {
        verificationRepository.getVerificationByCode.mockReturnValue(verificationMock);
        verificationRepository.deleteVerification.mockRejectedValue(
            new Error('/VerificataionRepository/deleteVerification'),
        )

        const res = await verifyService.deleteVerificationByCode(verificationMock.code);

        expect(res.toString()).toEqual('Error: /Verifications/deleteVerification/VerificataionRepository/deleteVerification');
        expect(verificationRepository.getVerificationByCode).toBeCalledTimes(1);
        expect(verificationRepository.deleteVerification).toBeCalledTimes(1);
      });

      /**
       * Test for deleteVerificationByUserId
       */
      it('deleteVerificationByUserId method should return true', async () => {
        verificationRepository.findOne.mockReturnValue(verificationMock);
        verificationRepository.deleteVerificationById.mockReturnValue(true);

        const res = await verifyService.deleteVerificationByUserId(userEntity.id);

        expect(res).toBeTruthy();
        expect(verificationRepository.findOne).toBeCalledTimes(1);
        expect(verificationRepository.deleteVerificationById).toBeCalledTimes(1);
      });

      it('deleteVerificationByUserId method should return false', async () => {
        verificationRepository.findOne.mockReturnValue(null);

        const res = await verifyService.deleteVerificationByUserId(userEntity.id);

        expect(res).toBeFalsy();
        expect(verificationRepository.findOne).toBeCalledTimes(1);
        expect(verificationRepository.deleteVerificationById).toBeCalledTimes(0);
      });

      /**
       * Test for getVerificationByCode
       */
      it('getVerificationByCode method should return verification Entity',async () => {
        verificationRepository.getVerificationByCode.mockReturnValue(verificationMock);

        const res = await verifyService.getVerificationByCode(verificationMock.code);

        expect(res).toEqual(verificationMock);
        expect(verificationRepository.getVerificationByCode).toBeCalledTimes(1);
      });

      it('getVerificationByCode method should return Error',async () => {
        verificationRepository.getVerificationByCode.mockRejectedValue(
            new Error('/FailToTest'),
        )

        const res = await verifyService.getVerificationByCode(verificationMock.code);

        expect(res.toString()).toEqual('Error: /Verifications/getVerificationByUserId/FailToTest');
        expect(verificationRepository.getVerificationByCode).toBeCalledTimes(1);
      });

});