import { IRestaurantRespository } from "../../../../restaurants/domain/repository/irestaurant.repository";
import { Repository } from "typeorm";
import { RestaurantEntity } from "../entities/restaurant.entity";
import { CreateRestaurantInput } from "../../../../restaurants/interface/dtos/create-restaurant.dto";
import { CustomRepository } from "../../../../common/class-decorator.ts/typeorm-ex.decorator";
import { TryCatch } from "../../../../common/method-decorator/trycatch.decorator";

@CustomRepository(RestaurantEntity)
export class RestaurantRepository extends Repository<RestaurantEntity> implements IRestaurantRespository {
    
    @TryCatch('/RestaurantRepository/createRestaurant')
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
        let errorMsg : string = null;

        const queryRunner = await this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            errorMsg = error.message;
        }  finally {
            await queryRunner.release();
        }

        if(errorMsg !== null) {
            throw new Error('/' + errorMsg);
        }

        return true;
    }

    @TryCatch('/RestaurantRepository/getOneRestaurantById')
    async getOneRestaurantById( 
        restaurantId : number 
    ) : Promise<RestaurantEntity> {
        const restaurant = await this.findOne({where : {id : restaurantId}});
        if(!restaurant) {
            throw new Error('/레스토랑을 찾을 수 없습니다.')
        }
        return restaurant;
    }

    @TryCatch('/RestaurantRepository/deleteRestaurant')
    async deleteRestaurant(
        restaurant: RestaurantEntity
    ) : Promise<boolean> {

        let errorMsg : string = null;

        const queryRunner = await this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.delete(RestaurantEntity, restaurant.id);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            errorMsg = error.mesage;
        } finally {
            await queryRunner.release();
        }

        if( errorMsg !== null ) {
            throw new Error('/' + errorMsg);
        }

        return true;
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