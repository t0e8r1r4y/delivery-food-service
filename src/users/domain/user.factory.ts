import { Injectable } from "@nestjs/common";
import { EventBus } from '@nestjs/cqrs';
import { UserRole } from "../infra/db/entities/user.entity";
import { User } from "./user";
import { UserCreateEvent } from "./user-created.event";

@Injectable()
export class UserFactory {
    constructor( private eventBus : EventBus ) {}

    create(
        id : number,
        email : string,
        password : string,
        userRole : UserRole,
        verified : boolean,
        createdAt : Date,
        updatedAt : Date,
        code : string,
    ) : User {
        const user = new User( id, email, password, userRole, verified, createdAt, updatedAt );
        this.eventBus.publish( new UserCreateEvent( user.email , code ) );
        return user;
    }

    reconstitute(
        id : number,
        email : string,
        password : string,
        userRole : UserRole,
        verified : boolean,
        createdAt : Date,
        updatedAt : Date,
    ) : User {
        return new User( id, email, password, userRole, verified, createdAt, updatedAt );
    }
}