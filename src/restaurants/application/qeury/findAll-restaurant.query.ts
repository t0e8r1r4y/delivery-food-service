import { IQuery } from "@nestjs/cqrs";

export class FindAllRestaurant implements IQuery {
    constructor(
        page : number,
    ) {}
}