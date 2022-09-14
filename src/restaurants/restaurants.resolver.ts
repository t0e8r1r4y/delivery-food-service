import { Resolver, Query, Args, Mutation, Int, ResolveField, Parent } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantInput, CreateRestaurnatOutput } from "./dtos/create-restaurant.dto"
import { RestaurantService } from "./restaurants.service";
import { AuthUser } from "../auth/auth-user.decorator";
import { UserEntity } from "../users/infra/db/entities/user.entity";
import { Role } from "../auth/role.decorator";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { Category } from "./entities/category.entity";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { Dish } from "./entities/dish.entitiy";
import { CreateDishOutput, CreateDishInput } from "./dtos/create-dish.dto";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";

// @TODO 
// - create Dish
// - Edit Dish
// - Delete Dish
const testResult = {ok:false, error: "테스트 중입니다."};

@Resolver(of => Restaurant)
export class RestaurantResolver {
    constructor(private readonly restaurnatService: RestaurantService) {}

    @Mutation(returns => CreateRestaurnatOutput)
    @Role(['Owner'])
    async createRestaurant(
        @AuthUser() authUser: UserEntity,
        @Args('input') CreateRestaurantInput : CreateRestaurantInput
    ) : Promise<CreateRestaurnatOutput> {
        return this.restaurnatService.createRestaurnat(
            authUser, 
            CreateRestaurantInput,
        );
    }

    @Mutation(returns => EditRestaurantOutput)
    @Role(['Owner'])
    async editRestaurant(
        @AuthUser() authUser : UserEntity,
        @Args('input') editRestaurantInput: EditRestaurantInput
    ) : Promise<EditRestaurantOutput> {
        return this.restaurnatService.editRestaurant(authUser, editRestaurantInput);
    }

    @Mutation(returns => DeleteRestaurantOutput)
    @Role(['Owner'])
    async deleteRestaurant(
        @AuthUser() owner : UserEntity,
        @Args('input') deleteRestaurantInput: DeleteRestaurantInput 
    ) : Promise<DeleteRestaurantOutput> {
        return this.restaurnatService.deleteRestaurant( owner, deleteRestaurantInput );
    }


    @Query(returns => RestaurantsOutput)
    async allRestaurants( @Args('input') restaurantInput : RestaurantsInput ) : Promise<RestaurantsOutput> {
        return this.restaurnatService.allRestaurants(restaurantInput);
    }

    @Query(returns => RestaurantOutput)
    async restaurant(
        @Args('input') restaurantInput : RestaurantInput,
    ) : Promise<RestaurantOutput> {
        return this.restaurnatService.findRestaurantById(restaurantInput);
    }

    @Query(returns => SearchRestaurantOutput)
    searchRestaurant( 
        @Args('input') searchRestaurantInput: SearchRestaurantInput, 
    ) : Promise<SearchRestaurantOutput> {
        return this.restaurnatService.searchRestaurantByName(searchRestaurantInput);
    }

    // @Query(returns => SearchRestaurantOutput)
    // async searchRestaurant(
    //   @Args('input') searchRestaurantInput: SearchRestaurantInput,
    // ): Promise<SearchRestaurantOutput> {
    //   return this.restaurnatService.searchRestaurantByName(searchRestaurantInput);
    // }
}


// @TODO - 구현 내용은 적지만 해당 내용 구분이 필요함
@Resolver(of => Category)
export class CategoryResolver {
    constructor(private readonly restaurantService : RestaurantService) {}

    @ResolveField( type => Int )
    restaurantCount(@Parent() category : Category ) : Promise<number> { // add cal logic
        console.log(category);
        return this.restaurantService.countRestaurants(category);
    }

    // 카테고리 전체 조회
    @Query(tpye => AllCategoriesOutput)
    allCategories() : Promise<AllCategoriesOutput> { 
        return this.restaurantService.allCategories()
    }

    @Query(type => CategoryOutput)
    category(@Args('input') categoryInput:CategoryInput) : Promise<CategoryOutput> {
        return this.restaurantService.findCategoryBySlug(categoryInput);
    } 
}


// @TODO - 구현 내용은 적지만 다시 파일을 구분하여 refactor
@Resolver(of => Dish)
export class DishResolver {
    constructor(private readonly restaurantService : RestaurantService) {}

    @Mutation(type => CreateDishOutput)
    @Role(['Owner'])
    async createDish(
        @AuthUser() owner: UserEntity,
        @Args('input') createDishInput : CreateDishInput
    ) : Promise<CreateDishOutput> {
        return this.restaurantService.createDish(owner, createDishInput);
    }

    @Mutation(type => EditDishOutput)
    @Role(['Owner'])
    async editDish(
        @AuthUser() owner : UserEntity,
        @Args('input') editDishInput : EditDishInput
    ) : Promise<EditDishOutput> {
        return this.restaurantService.editDish(owner, editDishInput);
    }

    @Mutation(type => DeleteDishOutput)
    @Role(['Owner'])
    async deleteDish(
        @AuthUser() owner : UserEntity,
        @Args('input') deleteDishInput : DeleteDishInput
    ) : Promise<DeleteDishOutput> {
        return this.restaurantService.deleteDish(owner, deleteDishInput);
    }
}
