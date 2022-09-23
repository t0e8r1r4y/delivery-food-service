import { IEvent } from '@nestjs/cqrs';
import { CqrsEvent } from '../../common/abstract-class/cqrs-event';

export class UserCreateEvent extends CqrsEvent implements IEvent {
    constructor (
        readonly email : string,
        readonly code : string
    ) {
        super( UserCreateEvent.name );
    }
}