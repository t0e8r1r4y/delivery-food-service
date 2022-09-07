import { Module } from '@nestjs/common';
import { getDataSourceToken, getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service'; 
import { UsersResolver } from './users.resolver'
import { Verification } from './entities/verification.entity';
import { DataSource } from 'typeorm';
import { DatabaseModule } from '../database/database.module';
import { userRepository } from './repositories/user.repository';

@Module({
    imports: [DatabaseModule],
    providers: [UsersResolver,UsersService, ...userRepository],
    exports: [ UsersService ]
})
export class UsersModule {}
