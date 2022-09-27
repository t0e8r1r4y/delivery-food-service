import { IDishReposiory } from "../../../../restaurants/domain/repository/idish.repository";
import { CreateDishInput } from "../../../../restaurants/interface/dtos/create-dish.dto";
import { Repository } from "typeorm";
import { DishEntity } from "../entities/dish.entitiy";
import { RestaurantEntity } from "../entities/restaurant.entity";
import { CustomRepository } from "../../../../common/class-decorator.ts/typeorm-ex.decorator";

@CustomRepository(DishEntity)
export class DishRepository extends Repository<DishEntity> implements IDishReposiory {
    createDish: (dishInput: CreateDishInput) => Promise<DishEntity>;
    saveDish: (dish: DishEntity, restaurant: RestaurantEntity) => Promise<DishEntity>;
    rollbackTransaction: () => Promise<boolean>;
    commitTransaction: () => Promise<boolean>;
    getOneDishById: (dishId: number) => Promise<DishEntity>;
    deleteDish: (dish: DishEntity) => Promise<boolean>;
    
}