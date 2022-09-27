import { IEventHandler } from "@nestjs/cqrs";
import { RestaurantCreateEvent } from "src/restaurants/domain/restaurant-created.event";


export class RestaurantEventHandler implements IEventHandler<RestaurantCreateEvent> {
    constructor() {}

    async handle(event: RestaurantCreateEvent) {
        
    }
}