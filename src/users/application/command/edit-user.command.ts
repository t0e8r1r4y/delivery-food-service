import { ICommand } from '@nestjs/cqrs';
import { PickType } from '@nestjs/graphql';
import { User } from '../../infra/entities/user.entity';

export class EditUserCommand extends PickType(User, ['email', 'password' ] ) implements ICommand {}