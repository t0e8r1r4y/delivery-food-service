import { InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "../../../common/dtos/output.dto";
import { UserEntity } from "../../infra/db/entities/user.entity";


@ObjectType()
export class EditProfileOutput extends CoreOutput {}

@InputType()
export class EditProfileInput extends PartialType( // partialType is Optional
    PickType(UserEntity, ["email", "password"]),
) {}