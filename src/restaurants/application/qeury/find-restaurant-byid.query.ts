import { IQuery } from "@nestjs/cqrs";

export class FindRestaurantById implements IQuery {
    constructor(
       readonly restaurantId : number, 
    ) {}
}