import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Raw, Repository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantInput, CreateRestaurnatOutput } from "./dtos/create-restaurant.dto";
import { User } from "src/users/entities/user.entity";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { Category } from "./entities/category.entity";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { RestaurantInput, RestaurantOutput } from  "./dtos/restaurant.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { Dish } from "./entities/dish.entitiy";

@Injectable()
export class RestaurantService {
    
    constructor(
        @InjectRepository(Restaurant) // only need entity
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Category)
        private readonly categories: Repository<Category>,
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>,
    ) {}

    /**
     * Todo - 해당 로직도 빼야된다.
     * 카테고리를 체크하고 있으면 카테고리를 리턴. 없으면 생성 후 리턴
     */
    async getOrCreateCategory( name : string ) : Promise<Category> {
        const categoryName = name.trim().toLowerCase();
        const categorySlug = categoryName.replace(/ /g, '-');
        let category = await this.categories.findOne( {where: { slug: categorySlug }} );
        if(!category) {
            category = await this.categories.save(this.categories.create({slug:categorySlug, name:categoryName}));
        }
        return category;
    }

    async createRestaurnat( 
        owner : User,
        createRestaurantInput : CreateRestaurantInput 
    ) : Promise<CreateRestaurnatOutput> {
        try {
            const newRestaurant = this.restaurants.create(createRestaurantInput);
            newRestaurant.owner = owner;

            // let category = await this.getOrCreateCategory( createRestaurantInput.categoryName );
            let category = await this.getOrCreateCategory( createRestaurantInput.categoryName );

            newRestaurant.category = category;
            await this.restaurants.save(newRestaurant);
            return { ok: true, error: null }; 
        } catch (error) {
            console.log(error);
            return { ok: false, error: "레스토랑을 생성할 수 없습ㄴ디ㅏ."};
        }
    }

   async editRestaurant( 
        owner: User, 
        editRestaurantInput: EditRestaurantInput
    ) : Promise<EditRestaurantOutput> {
        try {
            // 수정 할 레스토랑 찾기 -> findOne이 과연 어떻게 처리 될 지 테스트 필요
            const restaurant = await this.restaurants.findOne({
                where: {
                    id : editRestaurantInput.restaurantId
                },
                loadRelationIds: true,
            });
            // const restaurant = await this.restaurants.findOne( 
            //     {  
            //         where: editRestaurantInput,
            //         loadRelationIds: true 
            //     } 
            // );

            if(!restaurant) {
                return {
                    ok: false,
                    error: "레스토랑을 찾을 수 없습니다.",
                }
            }

            // 찾은 레스토랑 주인과 입력 받은 주인이 동일한 id인지 확인
            if(owner.id !== restaurant.owenrId) {
                return {
                    ok: false,
                    error: "입력받은 사장님 정보와 조회한 정보가 불일치 합니다.",
                }
            }

            // 레스토랑도 찾았고 입력받은 주인과 동일
            let category : Category = null;
            if(editRestaurantInput.categoryName) {
                category = await this.getOrCreateCategory(editRestaurantInput.categoryName);
            }

            await this.restaurants.save([
                {
                    id: editRestaurantInput.restaurantId,
                    ...editRestaurantInput,
                    ...(category && { category }),
                },
            ]);

            return { ok: true, }

        } catch (error) {
            console.log(error);
            return { ok: false, error : "레스토랑을 수정 할 수 없습니다. "};    
        }
    }
    
    // Todo - Refactoring할 때 로직에서 중복되는 내용들 정리
    async deleteRestaurant( 
        owner: User,
        deleteRestaurantIntput : DeleteRestaurantInput,
    ) : Promise<DeleteRestaurantOutput> {
        try {
            // 찾는다.
            const restaurant = await this.restaurants.findOne({
                where: {
                    id : deleteRestaurantIntput.restaurantId
                },
                loadRelationIds: true,
            });

            if(!restaurant) {
                return {
                    ok: false,
                    error: "삭제할 레스토랑을 찾을 수 없습니다.",
                }
            }
            // 사용자 정보가 일치하는지 본다.
            if(owner.id !== restaurant.owenrId) {
                return {
                    ok: false,
                    error: "입력받은 사장님 정보와 조회한 정보가 불일치 합니다.",
                }
            }
            // 삭제한다.
            await this.restaurants.delete(deleteRestaurantIntput.restaurantId);

            return {ok: true};
        } catch (error) {
            console.log(error);
            return {ok:false, error: "레스토랑을 삭제 할 수 없습니다. "};
        }
    }

    // getAll() : Promise<Restaurant[]> {
    //     return this.restaurants.find();
    // }


    // updateRestaurant({id, data} : UpdateRestaurantDto) {
    //     // UpdateRestaurantInputType
    //     return this.restaurants.update(id, {...data});
    // }

    async allCategories() : Promise<AllCategoriesOutput> {
        try {
            const categories = await this.categories.find();
            return { ok: true, categories };
        } catch (error) {
            console.log(error);
            return { ok : false , error: "카테고리를 찾을 수 없습니다." };
        }
    }

    async countRestaurants( category : Category ) {
        return this.restaurants.count(
            {
                where : {
                    category : {
                        id : category.id,
                    }
                },
            }
        );
    }

    async findCategoryBySlug( 
        categoryInput: CategoryInput
    ) : Promise<CategoryOutput> {
        try {
            const category = await this.categories.findOne(
                {
                    where : {
                        slug : categoryInput.slug,
                    },

                    // relations: ['restaurants'],
                }
            );

            if(!category){
                return { ok:false, error: "조회한 카테고리가 없습니다."};
            }

            const restaurants = await this.restaurants.find(
                {
                    where : {
                        category : {
                            id : category.id,
                        }
                    },
                    take: 25,
                    skip: (categoryInput.page - 1) * 25,
                }
            )
            category.restaurants = restaurants;
            const totalResults = await this.countRestaurants(category);
            return { ok:true, category:category, totalPages: Math.ceil(totalResults / 25) };
        } catch (error) {
            console.log(error);
            return {ok:false, error: "카테고리를 찾을 수 없습니다. "};
        }
    }

    async allRestaurants(restaurantInput : RestaurantsInput) : Promise<RestaurantsOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount(
                {
                    skip: (restaurantInput.page - 1) * 25,
                    take: 25,
                }
            );

            return {
                ok: true,
                restaurants,
                totalPages: Math.ceil(totalResults/25),
                totalResults,
            }
        } catch (error) {
            console.log(error);
            return {ok:false, error:"레스토랑을 찾을 수 없습니다."};
        }
    }


    async findRestaurantById(
        restaurantInput : RestaurantInput,
    ) : Promise<RestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(
                {
                    where : {
                        id : restaurantInput.restaurantId,
                    },
                    relations: ['menu'],
                }
            )
            if(!restaurant) {
                return { ok : false, error:"검색하신 레스토랑을 찾을 수 없습니다. "};
            }
            return { ok: true, restaurant };
        } catch (error) {
            console.log(error);
            return {ok:false, error:"레스토랑을 찾을 수 없습니다."};
        }
    }

    async searchRestaurantByName(
        searchRestaurantInput : SearchRestaurantInput
    ) : Promise<SearchRestaurantOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount(
                {
                    where : {
                        name: Like(`%${searchRestaurantInput.query}%`)
                        // name: Raw(name => `${name} ILIKE '%${searchRestaurantInput.query}%`)
                    },
                    skip: (searchRestaurantInput.page-1) * 25,
                    take: 25,
                }
            );
            return {
                ok: true,
                restaurants,
                totalResults,
                totalPages: Math.ceil(totalResults/25),
            }
        } catch (error) {
            console.log(error);
            return {ok:false, error:"검색한 결과를 찾을 수 없습니다."};
        }
    }

    async createDish(
        owner:User, createDishInput:CreateDishInput
    ) : Promise<CreateDishOutput> {
        try {
            // 일단 dish가 존재하기 위해서는 레스토랑이 있어야함
            const restaurant = await this.restaurants.findOne(
                {
                    where : {
                        id : createDishInput.restaurantId,
                    }
                }
            );

            if(!restaurant)
            {
                return { ok: false , error: "디시를 추가할 레스토랑을 찾지 못했습니다. "};
            }

            // 매장 주인 정보 확인
            if( owner.id !== restaurant.owenrId )
            {
                return { ok: false, error: "해당 사용자는 디시를 추가할 권한이 없습니다." };
            }

            // 매장이 있고 매장 주인 정보를 확인 함
            // 디시 생성
            // 아래 코드 보다는
            // let dish = this.dishes.create(createDishInput);
            // dish.restaurant = restaurnat;
            // await this.dishes.save(dish);
            const dish = await this.dishes.save(
                {...this.dishes.create(createDishInput), restaurant }
            )

            return {ok : true}
        } catch (error) {
            console.log(error);
            return { ok : false, error: "디시를 생성하지 못했습니다." };
        }    
    }

} // end class