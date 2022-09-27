import { Test } from "@nestjs/testing";
import { UserRepository } from "../../../users/infra/db/repository/user.repository";
import { GetUserInfoQueryHandler } from "./get-user-info.handler";
import { GetUserInfoQuery } from "./get-user-info.query";
import { UserEntity, UserRole } from "src/users/infra/db/entities/user.entity";
import { UserFactory } from "../../../users/domain/user.factory";
import { User } from "src/users/domain/user";

type MockRepository = Partial< Record< keyof UserRepository, jest.Mock > >;
type MockFactory = Partial< Record< keyof UserFactory, jest.Mock > >;

describe('getUserInfoHandler', () => {
    const input : GetUserInfoQuery = {
        userId : 1
    }

    const userEntity : UserEntity = {
        id: 1,
        email: 'test@naver.com',
        password: '12312312312',
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

    const user = new User( userEntity.id, userEntity.email, userEntity.password,
        userEntity.role, userEntity.verified, userEntity.createdAt, userEntity.updatedAt );

    let getUserInfoHandler : GetUserInfoQueryHandler;
    let userRepository : MockRepository;
    let userFactory : MockFactory;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
          providers : [
            GetUserInfoQueryHandler,
            {
                provide: UserFactory,
                useValue: {
                    create: jest.fn(),
                    reconstitute: jest.fn(),
                },
            },
            {
                provide: UserRepository,
                useValue: {
                    getUserAccountBy : jest.fn()
                }
            },
          ]  
        }).compile();

        getUserInfoHandler = module.get(GetUserInfoQueryHandler);
        userRepository = module.get(UserRepository);
        userFactory = module.get(UserFactory);
    });

    it('should return success.',async () => {
        userRepository.getUserAccountBy.mockReturnValue(userEntity);
        userFactory.reconstitute.mockReturnValue(user);

        const res = await getUserInfoHandler.execute(new GetUserInfoQuery(input.userId));

        expect(res.ok).toBeTruthy();
        expect(res.error).toBeUndefined();
        expect(res.user).toEqual(user);
        expect(userRepository.getUserAccountBy).toBeCalledTimes(1);
    });

    it('should return fail because it should fail to get user account.',async () => {
        userRepository.getUserAccountBy.mockRejectedValue(
            new Error('/fail to test'),
        );

        const res = await getUserInfoHandler.execute(new GetUserInfoQuery(input.userId));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/GetUserInfoQueryHandler/execute/fail to test');
        expect(res.user).toBeUndefined();
        expect(userRepository.getUserAccountBy).toBeCalledTimes(1);

    });
});