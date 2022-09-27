import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { SearchRestaurantByName } from "./search-restaurant-byname.query";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";
import { SearchRestaurantOutput } from "../../../restaurants/interface/dtos/search-restaurant.dto";

@QueryHandler(SearchRestaurantByName)
export class SearchRestaurantByNameHandler implements IQueryHandler<SearchRestaurantByName> {
    constructor() {}

    @TryCatchService('/SearchRestaurantByNameHandler/execute')
    async execute(
        query: SearchRestaurantByName
    ): Promise<SearchRestaurantOutput> {
        throw new Error("Method not implemented.");
    }
}