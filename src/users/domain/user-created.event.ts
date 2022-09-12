import { IEvent } from '@nestjs/cqrs';
import { User } from '../entities/user.entity';
import { CqrsEvent } from './cqrs-event';

export class UserCreateEvent extends CqrsEvent implements IEvent {
    constructor (
        readonly email : string,
        readonly code : string,
    ) {
        super( UserCreateEvent.name );
    }
}