import { Test } from "@nestjs/testing";
import { CategoryEntity } from "../../../restaurants/infra/db/entities/category.entity";
import { RestaurantEntity } from "../../../restaurants/infra/db/entities/restaurant.entity";
import { UserEntity, UserRole } from "../../../users/infra/db/entities/user.entity";
import { RestaurantRepository } from "../../../restaurants/infra/db/repository/restaurant.repository";
import { CategoryService } from "../service/category.service";
import { EditRestaurantHandler } from "./edit-restaurant.handler";

type MockRepository = Partial< Record <keyof RestaurantRepository, jest.Mock >>;
type MockService = Partial< Record< keyof CategoryService, jest.Mock > >;

describe('EditRestaurantHandler', () => {
    
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


    let editRestaurantHandler : EditRestaurantHandler;
    let restaurantRepository : MockRepository;
    let categoryService : MockService;
    
    beforeEach(async () => {
       const module = await Test.createTestingModule({
        providers: [
            EditRestaurantHandler,
            {
                provide : RestaurantRepository,
                useValue : {
                    getOneRestaurantById : jest.fn(),
                    deleteRestaurant : jest.fn(),
                    commitTransaction : jest.fn(),
                }
            }
        ],
       }).compile();

       editRestaurantHandler = module.get(EditRestaurantHandler);
       restaurantRepository = module.get(RestaurantRepository);
       categoryService = module.get(CategoryService);
    });

    it.todo('성공');
    it.todo('수정할 레스토랑을 발견하지 못하여 실패한 케이스');
    it.todo('레스토랑을 조회한 정보에서 입력받은 주인이 동일하지 않은 경우 실패');
    it.todo('수정값 반영이 실패한 경우 리턴');
    
})