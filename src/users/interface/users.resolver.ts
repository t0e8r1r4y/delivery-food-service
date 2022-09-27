import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { Role } from "../../auth/role.decorator";
import { AuthUser } from "../../auth/auth-user.decorator";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-acoount.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { LoginOutput, LoginInput } from "./dtos/login.dto";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";
import { UserEntity } from "../infra/db/entities/user.entity";
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from "../application/command/create-user.command";
import { QueryBus } from '@nestjs/cqrs';
import { GetUserInfoQuery  } from "../application/query/get-user-info.query";
import { LoginUserCommand } from "../application/command/login-user.command";
import { EditUserCommand } from "../application/command/edit-user.command";
import { VerifyEmailCommand } from "../application/command/verify-email.command";

@Resolver(of => UserEntity)
export class UsersResolver {
    constructor(
        private readonly commandBus : CommandBus,
        private readonly queryBus : QueryBus,
    ) {}

    @Mutation(returns => CreateAccountOutput)
    async createAccount(
        @Args("input") craeteAccountInput : CreateAccountInput
    ): Promise<CreateAccountOutput> {
        const command = new CreateUserCommand(craeteAccountInput.email, craeteAccountInput.password, craeteAccountInput.role);
        return this.commandBus.execute(command);
    }

    @Mutation(returns => LoginOutput)
    async login(
        @Args('input') loginInput: LoginInput
    ): Promise<LoginOutput> {
        const command = new LoginUserCommand(loginInput.email, loginInput.password);
        return this.commandBus.execute(command);
    }

    @Query(returns => UserEntity)
    @Role(['Any'])
    me(@AuthUser() authUser: UserEntity) {
        return authUser;
    }

    @Role(['Any'])
    @Mutation(returns => EditProfileOutput)
    async editProfile(
        @AuthUser() authUser: UserEntity,
        @Args('input') editProfileInput : EditProfileInput,
    ) : Promise<EditProfileOutput> {
        const command = new EditUserCommand( authUser.id, editProfileInput.email, editProfileInput.password );
        return this.commandBus.execute(command);
    }

    @Role(['Any'])
    @Query(returns => UserProfileOutput)
    async userProfile(
        @Args() userProfileInput: UserProfileInput
    ) : Promise<UserProfileOutput> {
        const getUserInfoQuery = new GetUserInfoQuery( userProfileInput.userId );
        return this.queryBus.execute( getUserInfoQuery );
    }

    @Mutation(returns => VerifyEmailOutput)
    async verifyEmail(
        @Args('input') { code }: VerifyEmailInput
    ): Promise<VerifyEmailOutput> {
        const command = new VerifyEmailCommand( code );
        return this.commandBus.execute(command);
    }

}