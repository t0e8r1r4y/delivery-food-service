import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { SearchRestaurantByName } from "./search-restaurant-byname.query";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";
import { SearchRestaurantOutput } from "../../../restaurants/interface/dtos/search-restaurant.dto";
import { RestaurantRepository } from "../../../restaurants/infra/db/repository/restaurant.repository";

@QueryHandler(SearchRestaurantByName)
export class SearchRestaurantByNameHandler implements IQueryHandler<SearchRestaurantByName> {
    constructor(
        private readonly restaurantRepository : RestaurantRepository,
    ) {}

    @TryCatchService('/SearchRestaurantByNameHandler/execute')
    async execute(
        query: SearchRestaurantByName
    ): Promise<SearchRestaurantOutput> {
        return;
    }
}