import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../jwt/jwt.service';
import { MailService } from '../../../mail/mail.service';
import { UserCreateEvent } from '../../../users/domain/user-created.event';

@EventsHandler(UserCreateEvent)
export class UserEventsHandler implements IEventHandler<UserCreateEvent> {
    constructor(
        private readonly mailService: MailService,
    ) {}

    async handle(event: UserCreateEvent) {
        switch (event.name) {
            case UserCreateEvent.name: {
                const { email, code } = event as UserCreateEvent;
                console.log(email, code);
                this.mailService.sendVerificationEmail( email, code );
                break;
            }
            default:
                break;
        }
    }

}