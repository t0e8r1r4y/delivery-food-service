import { Module } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service'; 
import { UsersResolver } from './users.resolver'
import { Verification } from './entities/verification.entity';
import { DataSource } from 'typeorm';
import { customUserRepositoryMethod } from './repositories/user.repository';

@Module({
    imports: [TypeOrmModule.forFeature([User, Verification])],
    providers: [UsersResolver,UsersService,],
    exports: [
        {
            provide: getRepositoryToken(User),
            inject: [getDataSourceToken()],
            useFactory(dataSource : DataSource) {
                return dataSource
                        .getRepository(User)
                        .extend(customUserRepositoryMethod);
            },
        },
        ,UsersService
    ]
})
export class UsersModule {}
