import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from './cqrs-event';
import { User } from './user';

export class UserCreateEvent extends CqrsEvent implements IEvent {
    constructor (
        readonly email : string,
        readonly code : string
    ) {
        super( UserCreateEvent.name );
    }
}