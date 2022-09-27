import { Resolver, Query, Args, Mutation, Int, ResolveField, Parent } from "@nestjs/graphql";
import { RestaurantEntity } from "../infra/db/entities/restaurant.entity";
import { CreateRestaurantInput, CreateRestaurnatOutput } from "./dtos/create-restaurant.dto"
import { RestaurantService } from "../application/service/restaurants.service";
import { AuthUser } from "../../auth/auth-user.decorator";
import { UserEntity } from "../../users/infra/db/entities/user.entity";
import { Role } from "../../auth/role.decorator";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";

@Resolver(of => RestaurantEntity)
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
}
