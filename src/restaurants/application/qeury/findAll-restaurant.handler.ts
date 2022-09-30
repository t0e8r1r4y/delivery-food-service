import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindAllRestaurant } from "./findAll-restaurant.query";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";
import { RestaurantsOutput } from "../../../restaurants/interface/dtos/restaurants.dto";
import { RestaurantRepository } from "../../../restaurants/infra/db/repository/restaurant.repository";

@QueryHandler(FindAllRestaurant)
export class FindAllRestaurantHandler implements IQueryHandler<FindAllRestaurant> {
    
    constructor(
        private readonly restaurantRepository : RestaurantRepository,
    ) {}

    @TryCatchService('/FindAllRestaurantHandler/execute')
    async execute( 
        page : number
    ): Promise<RestaurantsOutput> {
        const [restaurants, totalResults] = await this.restaurantRepository.getAllRestaurant(page);
        return {
            ok: true,
            restaurants,
            totalPages : Math.ceil(totalResults/25),
            totalResults,
        }
    }
    
}