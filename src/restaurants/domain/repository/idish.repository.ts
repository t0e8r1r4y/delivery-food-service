import { CreateDishInput } from "../../../restaurants/interface/dtos/create-dish.dto";
import { DishEntity } from "../../../restaurants/infra/db/entities/dish.entitiy";
import { RestaurantEntity } from "../../../restaurants/infra/db/entities/restaurant.entity";

export interface IDishReposiory {
        // create
        createDish : ( dishInput : CreateDishInput ) => Promise<DishEntity>;
        // save
        saveDish : ( dish : DishEntity, restaurant : RestaurantEntity ) => Promise<DishEntity>;
        // rollback
        rollbackTransaction : () => Promise<boolean>;
        // commit
        commitTransaction : () => Promise<boolean>;
        // findOne ( restaurantId, )
        getOneDishById : ( dishId : number ) => Promise<DishEntity>;
        // delete
        deleteDish : ( dish : DishEntity ) => Promise<boolean>;
}