import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "../../../common/dtos/output.dto";
import { RestaurantEntity } from "../../infra/db/entities/restaurant.entity";

// @ArgsType() -> @Args로 받는 경우
@InputType()
export class CreateRestaurantInput extends PickType(RestaurantEntity, 
    [
        'name', 
        'coverImage', 
        'address'
]) {
    @Field(type=>String)
    categoryName: string;
}//, InputType) {} <- 이런식으로 쓸 수 있음

@ObjectType()
export class CreateRestaurnatOutput extends CoreOutput {}