import {  Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from './auth.guard';

@Module({
    imports: [UsersModule, CqrsModule],
    providers: [{
        provide: APP_GUARD,
        useClass: AuthGuard,
    }]
})
export class AuthModule {}
