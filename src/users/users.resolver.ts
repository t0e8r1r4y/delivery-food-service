import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { Role } from "../auth/role.decorator";
import { AuthUser } from "../auth/auth-user.decorator";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-acoount.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { LoginOutput, LoginInput } from "./dtos/login.dto";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Resolver(of => User)
export class UsersResolver {
    constructor(
        private readonly usersService: UsersService
    ) { }

    @Mutation(returns => CreateAccountOutput)
    async createAccount(
        @Args("input") craeteAccountInput : CreateAccountInput
    ): Promise<CreateAccountOutput> {
        return this.usersService.createAccount(craeteAccountInput);        
    }

    @Mutation(returns => LoginOutput)
    async login(
        @Args('input') loginInput: LoginInput
    ): Promise<LoginOutput> {
        return this.usersService.login(loginInput);
    }

    @Query(returns => User)
    @Role(['Any'])
    me(@AuthUser() authUser: User) {
        return authUser;
    }

    @Role(['Any'])
    @Mutation(returns => EditProfileOutput)
    async editProfile(
        @AuthUser() authUser: User,
        @Args('input') editProfileInput: EditProfileInput,
    ) : Promise<EditProfileOutput> {
        return this.usersService.editProfile(authUser.id, editProfileInput);
    }

    @Role(['Any'])
    @Query(returns => UserProfileOutput)
    async userProfile(
        @Args() userProfileInput: UserProfileInput
    ): Promise<UserProfileOutput> {
        return this.usersService.findById(userProfileInput.userId);
    }

    @Mutation(returns => VerifyEmailOutput)
    async verifyEmail(
        @Args('input') { code }: VerifyEmailInput
    ): Promise<VerifyEmailOutput> {
        return this.usersService.verifyEmail(code);
    }

}