import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Raw, Repository } from "typeorm";
import { RestaurantEntity } from "../../infra/db/entities/restaurant.entity";
import { CreateRestaurantInput, CreateRestaurnatOutput } from "../../interface/dtos/create-restaurant.dto";
import { UserEntity } from "src/users/infra/db/entities/user.entity";
import { EditRestaurantInput, EditRestaurantOutput } from "../../interface/dtos/edit-restaurant.dto";
import { CategoryEntity } from "../../infra/db/entities/category.entity";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "../../interface/dtos/delete-restaurant.dto";
import { AllCategoriesOutput } from "../../interface/dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "../../interface/dtos/category.dto";
import { RestaurantsInput, RestaurantsOutput } from "../../interface/dtos/restaurants.dto";
import { RestaurantInput, RestaurantOutput } from  "../../interface/dtos/restaurant.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "../../interface/dtos/search-restaurant.dto";
import { CreateDishInput, CreateDishOutput } from "../../interface/dtos/create-dish.dto";
import { DishEntity } from "../../infra/db/entities/dish.entitiy";
import { EditDishInput, EditDishOutput } from "../../interface/dtos/edit-dish.dto";
import { DeleteDishInput, DeleteDishOutput } from "../../interface/dtos/delete-dish.dto";

@Injectable()
export class RestaurantService {
    
    constructor(
        @InjectRepository(RestaurantEntity) // only need entity
        private readonly restaurants: Repository<RestaurantEntity>,
        @InjectRepository(CategoryEntity)
        private readonly categories: Repository<CategoryEntity>,
        @InjectRepository(DishEntity)
        private readonly dishes: Repository<DishEntity>,
    ) {}

    /**
     * Todo - 해당 로직도 빼야된다.
     * 카테고리를 체크하고 있으면 카테고리를 리턴. 없으면 생성 후 리턴
     */
    async getOrCreateCategory( name : string ) : Promise<CategoryEntity> {
        const categoryName = name.trim().toLowerCase();
        const categorySlug = categoryName.replace(/ /g, '-');
        let category = await this.categories.findOne( {where: { slug: categorySlug }} );
        if(!category) {
            category = await this.categories.save(this.categories.create({slug:categorySlug, name:categoryName}));
        }
        return category;
    }

    async createRestaurnat( 
        owner : UserEntity,
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
            return { ok: false, error: "레스토랑을 생성할 수 없습니다."};
        }
    }

   async editRestaurant( 
        owner: UserEntity, 
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
            let category : CategoryEntity = null;
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
        owner: UserEntity,
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


    async allCategories() : Promise<AllCategoriesOutput> {
        try {
            const categories = await this.categories.find();
            return { ok: true, categories };
        } catch (error) {
            console.log(error);
            return { ok : false , error: "카테고리를 찾을 수 없습니다." };
        }
    }

    async countRestaurants( category : CategoryEntity ) {
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
                    order : {
                        isPromoted: 'DESC'
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
                    order : {
                        isPromoted: 'DESC',
                    }
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
        owner:UserEntity, createDishInput:CreateDishInput
    ) : Promise<CreateDishOutput> {
        try {

            console.log(createDishInput);
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


            const dish = await this.dishes.save(
                {...this.dishes.create(createDishInput), restaurant }
            )

            console.log(dish);

            return {ok : true,}
        } catch (error) {
            console.log(error);
            return { ok : false, error: "디시를 생성하지 못했습니다." };
        }    
    }

    async editDish(
        owner : UserEntity,
        editDishInput : EditDishInput,
    ) : Promise<EditDishOutput> {
        try {
            // 찾는다
            const dish = await this.dishes.findOne(
                {
                    where : {
                        id: editDishInput.dishId,
                    },
                    relations: ['restaurant'],
                }
            );

            if(!dish) {
                return {ok:false, error:"수정하고자 하는 dish가 없습니다."};
            }
            // 사용자 정보가 일치하는지 본다.
            if( owner.id !== dish.restaurant.owenrId )
            {
                return {ok:false, error:"레스토랑 오너가 아닙니다. dish를 수정 할 수 없습니다."};
            }
            // 업데이트
            await this.dishes.save([{
                id : editDishInput.dishId,
                ...editDishInput, 
            }])

            return {ok:true};
        } catch (error) {
            console.log(error);
            return {ok:false, error: "디시를 수정 할 수 없습니다. "};
        }
    }

    async deleteDish(
        owner : UserEntity,
        deleteDishInput : DeleteDishInput,
    ) : Promise<DeleteDishOutput> {
        try {
            // 찾는다
            const dish = await this.dishes.findOne(
                {
                    where : {
                        id: deleteDishInput.dishId,
                    },
                    relations: ['restaurant'],
                }
            );

            if(!dish) {
                return {ok:false, error:"삭제하고자 하는 dish가 없습니다."};
            }
            // 사용자 정보가 일치하는지 본다.
            if( owner.id !== dish.restaurant.owenrId )
            {
                return {ok:false, error:"레스토랑 오너가 아닙니다. dish를 삭제할 수 없습니다."};
            }
            // 삭제한다.
            await this.dishes.delete(deleteDishInput.dishId);
            return {ok:true};
        } catch (error) {
            console.log(error);
            return {ok:false, error: "삭제 할 수 없습니다."}
        }
    }

} // end class

