import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserInfoQuery } from './get-user-info.query';
import { UserRepository } from '../../infra/db/repository/user.repository';
import { UserProfileOutput } from '../../interface/dtos/user-profile.dto';
import { UserFactory } from "../../../users/domain/user.factory";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";


@QueryHandler(GetUserInfoQuery)
export class GetUserInfoQueryHandler implements IQueryHandler<GetUserInfoQuery> {
    constructor(
        private userFactory: UserFactory,
        private readonly users : UserRepository,
    ) {}
    
    @TryCatchService('/GetUserInfoQueryHandler/execute')
    async execute(
        query: GetUserInfoQuery
    ) : Promise<UserProfileOutput> {
        const { userId } = query;
        // 유저조회
        const userEntity = await this.users.getUserAccountBy(userId);

        const user =  this.userFactory.reconstitute(
            userEntity.id, userEntity.email, userEntity.password,
            userEntity.role, userEntity.verified, userEntity.createdAt, userEntity.updatedAt
        );
        // 결과 리턴
        return { ok : true, user : user };
    }
}