import { Module } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service'; 
import { UsersResolver } from './users.resolver'
import { Verification } from './entities/verification.entity';
import { DataSource, Repository } from 'typeorm';
import { TypeOrmCustomModule } from '../common/typeorm-ex.module';
import { UserRepository } from './repository/user.repository';
import { VerificataionRepository } from './repository/verification.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { UserEventsHandler } from './application/event/user-events.handler';
import { CreateUserHandler } from './application/command/create-user.handler';
import { UserFactory } from './domain/user.factory';

const commandHandlers = [
    CreateUserHandler,
];

const queryHandlers = [

];

const eventHandlers = [
    UserEventsHandler,
];

const factories = [
    UserFactory,
];


@Module({
    imports: [
        TypeOrmCustomModule.forCustomRepository([UserRepository, VerificataionRepository]), 
        TypeOrmModule.forFeature([User, Verification]),
        CqrsModule,
    ],
    providers: [
        UsersResolver, 
        UsersService,
        ...eventHandlers,
        ...commandHandlers,
        ...factories
    ],
    exports: [ UsersService ]
})
export class UsersModule {}
