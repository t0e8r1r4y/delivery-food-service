import { ArgsType, Field, ObjectType } from "@nestjs/graphql";
import { type } from "os";
import { CoreOutput } from "../../common/dtos/output.dto";
import { User } from "../entities/user.entity";

@ArgsType()
export class UserProfileInput {
    @Field(type=>Number)
    userId: number;
}


@ObjectType()
export class UserProfileOutput extends CoreOutput {
    @Field(tpye=>User, {nullable:true})
    user?: User;
}