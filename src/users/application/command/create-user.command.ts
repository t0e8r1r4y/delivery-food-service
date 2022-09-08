import { ICommand } from '@nestjs/cqrs';
import { UserRole } from 'src/users/entities/user.entity';

export class CreateUserCommand implements ICommand {
    constructor(
        readonly email : string,
        readonly password : string,
        readonly role : UserRole,
    ) {}
}