import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "../../../common/dtos/output.dto";
import { UserEntity } from "../../infra/db/entities/user.entity";

@InputType()
export class LoginInput extends PickType(UserEntity, ["email", "password"]) {};

@ObjectType()
export class LoginOutput extends CoreOutput {
    @Field(type => String, {nullable:true})
    token?: string;
}