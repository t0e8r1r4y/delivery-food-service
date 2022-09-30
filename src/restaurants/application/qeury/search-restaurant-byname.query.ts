import { IQuery } from "@nestjs/cqrs";

export class SearchRestaurantByName implements IQuery {
    constructor( 
        readonly qeury : string,
        readonly page : number
    ) {}
}