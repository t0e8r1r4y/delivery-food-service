import { Extensions, Field, InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "../../common/dtos/output.dto";
import { Restaurant } from "../entities/restaurant.entity";
import { CreateRestaurantInput } from "./create-restaurant.dto";


@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput){
    @Field( type => Number )
    restaurantId : number;
}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput {}
// export class EditRestaurantInput extends PartialType(
//     PickType(
//         Restaurant, ["address", "name", "coverImage"]
//     )
// ) {
//     @Field(tpye => String)
//     categoryName : string;
// }