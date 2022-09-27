import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreateEvent } from '../../../users/domain/user-created.event';
import { IEmailService } from '../adapter/iemail.service';

@EventsHandler(UserCreateEvent)
export class UserEventsHandler implements IEventHandler<UserCreateEvent> {
    constructor(
        // private readonly mailService: MailService,
        @Inject('EmailService') private emailServie: IEmailService,
    ) {}

    async handle(event: UserCreateEvent) {
        switch (event.name) {
            case UserCreateEvent.name: {
                const { email, code } = event as UserCreateEvent;
                await this.emailServie.sendUserAccountJoinVerification(email, code);
                break;
            }
            default:
                break;
        }
    }

}