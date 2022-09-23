import { IEvent } from "@nestjs/cqrs";
import { CqrsEvent } from "src/common/abstract-class/cqrs-event";

export class RestaurantCreateEvent extends CqrsEvent implements IEvent {
    constructor() {
        super( RestaurantCreateEvent.name );
    }
}