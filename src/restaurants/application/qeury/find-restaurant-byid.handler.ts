import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { FindRestaurantById } from "./find-restaurant-byid.query";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";
import { RestaurantOutput } from "../../../restaurants/interface/dtos/restaurant.dto";
import { RestaurantRepository } from "../../../restaurants/infra/db/repository/restaurant.repository";

@QueryHandler(FindRestaurantById)
export class FindRestaurantByIdHandler implements IQueryHandler<FindRestaurantById> {
    
    constructor(
        private readonly restaurantRepository : RestaurantRepository,
    ) {}
    
    @TryCatchService('/FindRestaurantByIdHandler/execute')
    async execute(
        query: FindRestaurantById
    ): Promise<RestaurantOutput> {
        const { restaurantId } = query;

        const restaurant = await this.restaurantRepository.getOneRestaurantById(restaurantId);

        return { ok: true,  restaurant };
    }

}