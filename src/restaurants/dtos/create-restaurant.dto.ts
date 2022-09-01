import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "../../common/dtos/output.dto";
import { Restaurant } from "../entities/restaurant.entity";

// @ArgsType() -> @Args로 받는 경우
@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, 
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
// export class CreateRestaurantDto {
    
//     @Field(type => String)
//     @IsString()
//     @Length(5, 10)
//     name : string;

//     @Field(type => Boolean)
//     @IsBoolean() 
//     isVegan : boolean;

//     @Field(type => String)
//     @IsString()
//     address : string;

//     @Field(type => String)
//     @IsString()
//     ownersName : string;
// }