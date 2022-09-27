import { Test } from "@nestjs/testing";
import { RestaurantRepository } from "../../../restaurants/infra/db/repository/restaurant.repository";
import { UserEntity, UserRole } from "../../../users/infra/db/entities/user.entity";
import { RestaurantEntity } from "../../../restaurants/infra/db/entities/restaurant.entity";
import { DeleteRestaurantHandler } from "./delete-restaurant.handler";
import { CategoryEntity } from "../../../restaurants/infra/db/entities/category.entity";
import { DeleteRestaurantCommand } from "./delete-restaurant.command";


type MockRepository = Partial< Record <keyof RestaurantRepository, jest.Mock >>;

describe('DeleteRestaurantHandler', () => {

    const mockDataWrongUser : UserEntity = {
        email: "test2@naver.com",
        password: "kasjdfl;kjasdfjl;asf",
        role: UserRole.Owner,
        verified: true,
        restaurants: [],
        orders: [],
        payments: [],
        riders: [],
        hassPassword: function (): Promise<void> {
            throw new Error("Function not implemented.");
        },
        checkPassword: function (pw: string): Promise<boolean> {
            throw new Error("Function not implemented.");
        },
        id: 2,
        createdAt: new Date('2022-09-02 11:22:22.891575'),
        updatedAt: new Date('2022-09-02 11:22:22.891575')
    }

    const mockDataUser : UserEntity = {
        email: "test@naver.com",
        password: "kasjdfl;kjasdfjl;asf",
        role: UserRole.Owner,
        verified: true,
        restaurants: [],
        orders: [],
        payments: [],
        riders: [],
        hassPassword: function (): Promise<void> {
            throw new Error("Function not implemented.");
        },
        checkPassword: function (pw: string): Promise<boolean> {
            throw new Error("Function not implemented.");
        },
        id: 1,
        createdAt: new Date('2022-09-02 11:22:22.891575'),
        updatedAt: new Date('2022-09-02 11:22:22.891575')
    }

    const mockDataRestaurant : RestaurantEntity = {
        name: "test Restaurant",
        coverImage: "https://aws.s3.comma/",
        address: "서울시 서초구 강남대로 테스트 주소다.",
        category: new CategoryEntity,
        owner: mockDataUser,
        orders: [],
        owenrId: 1,
        menu: [],
        isPromoted: false,
        id: 111,
        createdAt: new Date('2022-09-02 11:22:22.891575'),
        updatedAt: new Date('2022-09-02 11:22:22.891575')
    };

    let deleteRestaurantHandler : DeleteRestaurantHandler;
    let restaurantRepository : MockRepository;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [
            DeleteRestaurantHandler,
            {
                provide : RestaurantRepository,
                useValue: {
                    getOneRestaurantById : jest.fn(),
                    deleteRestaurant : jest.fn(),
                    commitTransaction : jest.fn(),
                }
            }
        ]
      }).compile()  

      deleteRestaurantHandler = module.get(DeleteRestaurantHandler);
      restaurantRepository = module.get(RestaurantRepository);
    }); // end beforeEach

    it('DeleteRestaurantHandler method should return success', async () => {
        restaurantRepository.getOneRestaurantById.mockReturnValue(mockDataRestaurant);
        restaurantRepository.deleteRestaurant.mockReturnValue(true);
        restaurantRepository.commitTransaction.mockReturnValue(true);

        const res = await deleteRestaurantHandler.execute(new DeleteRestaurantCommand(mockDataRestaurant.id, mockDataUser));

        expect(res.ok).toBeTruthy();
        expect(restaurantRepository.getOneRestaurantById).toBeCalledTimes(1);
        expect(restaurantRepository.deleteRestaurant).toBeCalledTimes(1);
        expect(restaurantRepository.commitTransaction).toBeCalledTimes(1);
    });

    it('DeleteRestaurantHandler method should return fail becuase there is nothing to delete. ',async () => {
        restaurantRepository.getOneRestaurantById.mockRejectedValue(
            new Error('/Fail to find restaurant.'),
        )
        restaurantRepository.deleteRestaurant.mockReturnValue(true);
        restaurantRepository.commitTransaction.mockReturnValue(true);

        const res = await deleteRestaurantHandler.execute(new DeleteRestaurantCommand(mockDataRestaurant.id, mockDataUser));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/DeleteRestaurantHandler/execute/Fail to find restaurant.');
        expect(restaurantRepository.getOneRestaurantById).toBeCalledTimes(1);
        expect(restaurantRepository.deleteRestaurant).toBeCalledTimes(0);
        expect(restaurantRepository.commitTransaction).toBeCalledTimes(0);
    });

    it('DeleteRestaurantHandler method should return fail owner info is wrong.',async () => {
        restaurantRepository.getOneRestaurantById.mockReturnValue(mockDataRestaurant);
        restaurantRepository.deleteRestaurant.mockReturnValue(true);
        restaurantRepository.commitTransaction.mockReturnValue(true);

        const res = await deleteRestaurantHandler.execute(new DeleteRestaurantCommand(mockDataRestaurant.id, mockDataWrongUser));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/DeleteRestaurantHandler/execute/입력 받은 사용자가 소유한 레스토랑이 아닙니다.');
        expect(restaurantRepository.getOneRestaurantById).toBeCalledTimes(1);
        expect(restaurantRepository.deleteRestaurant).toBeCalledTimes(0);
        expect(restaurantRepository.commitTransaction).toBeCalledTimes(0);
    });

    it('DeleteRestaurantHandler method should return fail to delete.',async () => {
        restaurantRepository.getOneRestaurantById.mockReturnValue(mockDataRestaurant);
        restaurantRepository.deleteRestaurant.mockRejectedValue(
            new Error('/Fail to delete.'),
        )
        restaurantRepository.commitTransaction.mockReturnValue(true);

        const res = await deleteRestaurantHandler.execute(new DeleteRestaurantCommand(mockDataRestaurant.id, mockDataUser));

        expect(res.ok).toBeFalsy();
        expect(res.error).toEqual('/DeleteRestaurantHandler/execute/Fail to delete.');
        expect(restaurantRepository.getOneRestaurantById).toBeCalledTimes(1);
        expect(restaurantRepository.deleteRestaurant).toBeCalledTimes(1);
        expect(restaurantRepository.commitTransaction).toBeCalledTimes(0);
    });

});