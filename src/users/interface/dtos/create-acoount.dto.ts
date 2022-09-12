import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "../../../common/dtos/output.dto";
import { User } from "../../infra/entities/user.entity"

@InputType()
export class CreateAccountInput extends PickType(User, ['email', 'password', 'role'] ){}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}
// @ObjectType()
// export class CreateAccountOutput {
//     @Field(type=> String, {nullable: true})
//     error ?: string;

//     @Field(type => Boolean)
//     ok : boolean;

// }