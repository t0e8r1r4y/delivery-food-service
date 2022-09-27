import { EventBus } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { Restaurant } from "./restaurant";
import { RestaurantCreateEvent } from "./restaurant-created.event";

@Injectable()
export class RestaurantFactory {
    constructor( private eventBus : EventBus){}

    create(
        id : number,
        name : string,
        coverImage : string,
        address : string,
        categoryId : number,
        ownerId : number,
        isPromoted : boolean,
        promotedUntil : Date,
        createdAt : Date,
        updatedAt : Date,
    ) : Restaurant {
        const restaurant = new Restaurant( id, name, coverImage, address, categoryId, ownerId, isPromoted,
                                            promotedUntil, createdAt, updatedAt );
        this.eventBus.publish( new RestaurantCreateEvent() );
        return restaurant;
    }

    reconstitute(
        id : number,
        name : string,
        coverImage : string,
        address : string,
        categoryId : number,
        ownerId : number,
        isPromoted : boolean,
        promotedUntil : Date,
        createdAt : Date,
        updatedAt : Date,
    ) : Restaurant {
        return new Restaurant( id, name, coverImage, address, categoryId, ownerId, isPromoted,
                               promotedUntil, createdAt, updatedAt );
    }
} 