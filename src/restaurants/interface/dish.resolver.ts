import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { UserEntity } from "../../users/infra/db/entities/user.entity";
import { AuthUser } from "../../auth/auth-user.decorator";
import { DishEntity } from "../infra/db/entities/dish.entitiy";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { RestaurantService } from "../application/service/restaurants.service";
import { Role } from "../../auth/role.decorator";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";

@Resolver(of => DishEntity)
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