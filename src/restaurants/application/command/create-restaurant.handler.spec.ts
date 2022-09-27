import { Test } from "@nestjs/testing";
import { CategoryEntity } from "../../../restaurants/infra/db/entities/category.entity";
import { RestaurantEntity } from "../../../restaurants/infra/db/entities/restaurant.entity";
import { UserEntity, UserRole } from "../../../users/infra/db/entities/user.entity";
import { RestaurantRepository } from "../../../restaurants/infra/db/repository/restaurant.repository";
import { CategoryService } from "../service/category.service";
import { CreateRestaurnatHandler } from "./create-restaurant.handler";
import { CreateRestaurnatCommand } from "./create-restaurant.command";

type MockRepository = Partial< Record <keyof RestaurantRepository, jest.Mock >>;
type MockService = Partial< Record< keyof CategoryService, jest.Mock > >;

describe('CreateRestaurnatHandler', () => {

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
        owner: null,
        orders: [],
        owenrId: 1,
        menu: [],
        isPromoted: false,
        id: 111,
        createdAt: new Date('2022-09-02 11:22:22.891575'),
        updatedAt: new Date('2022-09-02 11:22:22.891575')
    };

    const mockDataCategory : CategoryEntity = {
        name: "korean Food",
        coverImage: "https://test/location/koranFood",
        slug: "koreanfood",
        restaurants: [],
        id: 1,
        createdAt: new Date('2022-09-02 11:22:22.891575'),
        updatedAt: new Date('2022-09-02 11:22:22.891575')
    }

    let createRestaurantHandler : CreateRestaurnatHandler;
    let restaurantRepository : MockRepository;
    let categoryService : MockService;


    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [
            CreateRestaurnatHandler,
            {
                provide: RestaurantRepository,
                useValue: {
                    createRestaurant: jest.fn(),
                    saveRestaurant: jest.fn(),
                }
            },
            {
                provide: CategoryService,
                useValue: {
                    getOrCreateCategory: jest.fn(),
                }
            }
        ]
      }).compile();     
      
      createRestaurantHandler = module.get(CreateRestaurnatHandler);
      restaurantRepository = module.get(RestaurantRepository);
      categoryService = module.get(CategoryService);
    }); // end beforeEach

    
    it('CreateRestaurantHandler method should return true',async () => {
        restaurantRepository.createRestaurant.mockReturnValue(mockDataRestaurant);
        categoryService.getOrCreateCategory.mockReturnValue(mockDataCategory);
        restaurantRepository.saveRestaurant.mockReturnValue(mockDataRestaurant);

        const res = await createRestaurantHandler.execute(new CreateRestaurnatCommand( mockDataRestaurant.name, mockDataRestaurant.coverImage, mockDataRestaurant.address, "korea Foor", mockDataUser ));

        expect(res.ok).toBeTruthy();
        expect(restaurantRepository.createRestaurant).toBeCalledTimes(1);
        expect(categoryService.getOrCreateCategory).toBeCalledTimes(1);
        expect(restaurantRepository.saveRestaurant).toBeCalledTimes(1);
    });

    it('CreateRestaurantHandler method should return error, becaue it should fail to create Restaurant Entity.',async () => {
        restaurantRepository.createRestaurant.mockRejectedValue(
            new Error('/Fail to Create retaurant instance.'),
        )
        categoryService.getOrCreateCategory.mockReturnValue(mockDataCategory);
        restaurantRepository.saveRestaurant.mockReturnValue(mockDataRestaurant);

        const res = await createRestaurantHandler.execute(new CreateRestaurnatCommand( mockDataRestaurant.name, mockDataRestaurant.coverImage, mockDataRestaurant.address, "korea Foor", mockDataUser ));

        expect(res.ok).toBeFalsy();
        expect(restaurantRepository.createRestaurant).toBeCalledTimes(1);
        expect(categoryService.getOrCreateCategory).toBeCalledTimes(0);
        expect(restaurantRepository.saveRestaurant).toBeCalledTimes(0);
    });

    it('CreateRestaurantHandler method should return error, becaue it should fail to get Catogory.',async () => {
        restaurantRepository.createRestaurant.mockReturnValue(mockDataRestaurant);
        categoryService.getOrCreateCategory.mockRejectedValue(
            new Error('/Fail to get category.'),
        )
        restaurantRepository.saveRestaurant.mockReturnValue(mockDataRestaurant);

        const res = await createRestaurantHandler.execute(new CreateRestaurnatCommand( mockDataRestaurant.name, mockDataRestaurant.coverImage, mockDataRestaurant.address, "korea Foor", mockDataUser ));

        expect(res.ok).toBeFalsy();
        expect(restaurantRepository.createRestaurant).toBeCalledTimes(1);
        expect(categoryService.getOrCreateCategory).toBeCalledTimes(1);
        expect(restaurantRepository.saveRestaurant).toBeCalledTimes(0);
    });

    
    it('CreateRestaurantHandler method should return error, becaue it should fail to save Restaurant Entity.',async () => {
        restaurantRepository.createRestaurant.mockReturnValue(mockDataRestaurant);
        categoryService.getOrCreateCategory.mockReturnValue(mockDataCategory);
        restaurantRepository.saveRestaurant.mockRejectedValue(
            new Error('/Fail to save restaurant entity.'),
        )

        const res = await createRestaurantHandler.execute(new CreateRestaurnatCommand( mockDataRestaurant.name, mockDataRestaurant.coverImage, mockDataRestaurant.address, "korea Foor", mockDataUser ));

        expect(res.ok).toBeFalsy();
        expect(restaurantRepository.createRestaurant).toBeCalledTimes(1);
        expect(categoryService.getOrCreateCategory).toBeCalledTimes(1);
        expect(restaurantRepository.saveRestaurant).toBeCalledTimes(1);
    });

});