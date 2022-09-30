import { IRestaurantRespository } from "../../../../restaurants/domain/repository/irestaurant.repository";
import { Like, Repository } from "typeorm";
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

    @TryCatch('/RestaurantRepository/searchRestaurantByName')
    async searchRestaurantByName(
        query : string,
        page : number,
    ) : Promise<[restaurants : RestaurantEntity[], totalResults :number]> {
            
        const [restaurants, totalResults] = await this.findAndCount({
            where : { name : Like(`%${query}%`)},
            skip : (page-1) * 25,
            take: 25,
        });

        if( totalResults === 0 && restaurants === null ) {
            throw new Error('/결과를 찾을 수 없습니다.');
        }
    
        return [restaurants, totalResults];
    }

    async countRestaurantByCategoryId(
        id: number
    ) : Promise<number>{
        return;
    }

    async getRestaurantBySlug() : Promise<RestaurantEntity[]> {
        return;
    }

    @TryCatch('/RestaurantRepository/getAllRestaurant')
    async getAllRestaurant(
        page : number,
    ) : Promise<[RestaurantEntity[], number]> {

        const [restaurants, totalResults] = await this.findAndCount({
            skip : (page-1) * 25,
            take : 25,
            order : {
                isPromoted : 'DESC',
            }
        });

        if(restaurants === null && totalResults === 0) {
            throw new Error('/결과를 찾을 수 없습니다.');
        }

        return [restaurants, totalResults];
    }

}