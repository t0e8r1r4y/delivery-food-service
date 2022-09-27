import { IRestaurantRespository } from "../../../../restaurants/domain/repository/irestaurant.repository";
import { Repository } from "typeorm";
import { RestaurantEntity } from "../entities/restaurant.entity";
import { CreateRestaurantInput } from "../../../../restaurants/interface/dtos/create-restaurant.dto";
import { CustomRepository } from "../../../../common/class-decorator.ts/typeorm-ex.decorator";

@CustomRepository(RestaurantEntity)
export class RestaurantRepository extends Repository<RestaurantEntity> implements IRestaurantRespository {
    
    async createRestaurant(
        creatInput: CreateRestaurantInput
    ) : Promise<RestaurantEntity> {
        const restaurant = this.create(creatInput);
        return restaurant;
    }

    async saveRestaurant(
        saveInput: any
    ) : Promise<RestaurantEntity> {
        return;
    }

    async rollbackTransaction() : Promise<boolean> {
        return;
    }

    async commitTransaction() : Promise<boolean> {
        return;
    }

    async getOneRestaurantById() : Promise<RestaurantEntity> {
        return;
    }

    async deleteRestaurant(
        restaurant: RestaurantEntity
    ) : Promise<boolean> {
        return;
    }

    async countRestaurantByCategoryId(
        id: number
    ) : Promise<number>{
        return;
    }

    async getRestaurantBySlug() : Promise<RestaurantEntity[]> {
        return;
    }

    async getAllRestaurant() : Promise<[RestaurantEntity[], number]> {
        return;
    }

}