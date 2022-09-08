import { ICommand } from '@nestjs/cqrs';
import { PickType } from '@nestjs/graphql';
import { User } from '../../../users/entities/user.entity';

export class EditUserCommand extends PickType(User, ['email', 'password' ] ) implements ICommand {}