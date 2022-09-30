import { CreateRestaurantInput } from "../../../restaurants/interface/dtos/create-restaurant.dto";
import { RestaurantEntity } from "../../../restaurants/infra/db/entities/restaurant.entity";


export interface IRestaurantRespository {

    // create
    createRestaurant : ( creatInput : CreateRestaurantInput ) => Promise<RestaurantEntity>;
    // save
    saveRestaurant : ( saveInput : any ) => Promise<RestaurantEntity>;
    // rollback
    rollbackTransaction : () => Promise<boolean>;
    // commit
    commitTransaction : () => Promise<boolean>;
    // findOne ( restaurantId, )
    getOneRestaurantById : (restaurantId : number) => Promise<RestaurantEntity>;
    // delete
    deleteRestaurant : ( restaurant : RestaurantEntity ) => Promise<boolean>;
    // count
    countRestaurantByCategoryId : ( id : number ) => Promise<number>;
    // find ( 조건 )
    getRestaurantBySlug : () => Promise<RestaurantEntity[]>;
    // findAndCount
    getAllRestaurant : ( page : number ) => Promise<[RestaurantEntity[], number]>;

}