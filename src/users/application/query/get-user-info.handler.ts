import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUserInfoQuery } from './get-user-info.query';
import { UserInfo } from '../../../users/interface/UserInfo';
import { UserRepository } from '../../../users/repository/user.repository';
import { User } from '../../../users/entities/user.entity';
import { UserProfileOutput } from '../../../users/dtos/user-profile.dto';
import { TryCatch } from '../../../common/trycatch.decorator';


@QueryHandler(GetUserInfoQuery)
export class GetUserInfoQueryHandler implements IQueryHandler<GetUserInfoQuery> {
    constructor(
        private readonly users : UserRepository,
    ) {}
    
    @TryCatch('GetUserInfoQueryHandler Error - ')
    async execute(
        query: GetUserInfoQuery
    ) : Promise<UserProfileOutput> {
        const { userId } = query;
        console.log(userId);
        const user = await this.users.getUserAccountById(userId);

        if(!user) {
            throw new NotFoundException('유저가 존재하지 않습니다.');
        }

        return { ok : true, user : user.user };
    }
}