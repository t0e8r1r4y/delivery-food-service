import { Injectable } from "@nestjs/common";
import { EventBus } from '@nestjs/cqrs';
import { User } from "../entities/user.entity";
import { UserCreateEvent } from "./user-created.event";

@Injectable()
export class UserFactory {
    constructor( private eventBus : EventBus ) {}

    create(
        email : string,
        code : string,
    ) : void {
        this.eventBus.publish(new UserCreateEvent(email, code));
        return
    }
}