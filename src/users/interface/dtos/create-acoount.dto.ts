import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { NotIn } from "../../../common/decorator/not-in.decorator";
import { User } from "../../../users/domain/user";
import { CoreOutput } from "../../../common/dtos/output.dto";
import { UserEntity } from "../../infra/db/entities/user.entity"
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

@InputType()
export class CreateAccountInput extends PickType(UserEntity, ['email', 'password', 'role'] ){
    @Transform(params => params.value.trim())
    @NotIn('password', { message: 'password는 name과 같은 문자열을 포함할 수 없습니다.' })
    @IsEmail()
    @IsString()
    @MinLength(8)
    @MaxLength(30)
    readonly email : string;

    @Transform(params => params.value.trim())
    @IsString()
    @Matches(/^[A-Za-z\d!@#$%^&*()]{8,30}$/)
    readonly password : string;
}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}