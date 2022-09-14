import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infra/db/entities/user.entity';
import { UsersResolver } from './interface/users.resolver'
import { Verification } from './infra/db/entities/verification.entity';
import { TypeOrmCustomModule } from '../common/typeorm-ex.module';
import { UserRepository } from './infra/db/repository/user.repository';
import { VerificataionRepository } from './infra/db/repository/verification.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { UserEventsHandler } from './application/event/user-events.handler';
import { CreateUserHandler } from './application/command/create-user.handler';
import { UserFactory } from './domain/user.factory';
import { GetUserInfoQueryHandler } from './application/query/get-user-info.handler';
import { LoginUserHandler } from './application/command/login-user.handler';
import { EditUserHandler } from './application/command/edit-user.handler';
import { EmailService } from './infra/adapter/email.service';

const commandHandlers = [
    CreateUserHandler,
    LoginUserHandler,
    EditUserHandler,
];

const queryHandlers = [
    GetUserInfoQueryHandler,
];

const eventHandlers = [
    UserEventsHandler,
];

const factories = [
    UserFactory,
];

const repositories = [
    { provide: 'UserRepository', useClass: UserRepository },
    { provide: 'EmailService', useClass: EmailService },
];


@Module({
    imports: [
        TypeOrmCustomModule.forCustomRepository([ VerificataionRepository]), // UserRepository
        TypeOrmModule.forFeature([UserEntity, Verification]),
        CqrsModule,
    ],
    providers: [
        UsersResolver, 
        UserRepository,
        ...eventHandlers,
        ...commandHandlers,
        ...factories,
        ...queryHandlers,
        ...repositories,
    ],
    exports: [  ]
})
export class UsersModule {}
