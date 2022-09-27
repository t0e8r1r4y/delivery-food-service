import { IQuery } from "@nestjs/cqrs";

export class SearchRestaurantByName implements IQuery {
    constructor( 
        readonly name  : string,
        readonly page : number
    ) {}
}