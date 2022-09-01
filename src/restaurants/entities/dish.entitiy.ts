import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString, Length } from "class-validator";
import { CoreEntity } from "../../common/entities/core.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@InputType('DishOptionsInputType', {isAbstract:true})
@ObjectType()
class DishOption {
    @Field(type => String)
    name : string

    @Field(type=>[String], {nullable:true})
    choices?: string[];

    @Field(type=>Int)
    extra : number;
}


@InputType('DishInputType', {isAbstract:true})
@ObjectType()
@Entity()
export class Dish extends CoreEntity {

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name : string;

    @Field(tpye => Int)
    @Column()
    @IsNumber()
    price : number;

    @Field(tpye => String, {nullable: true})
    @Column({nullable: true})
    @IsString()
    photo : string;

    @Field(type => String)
    @Column()
    @Length(5, 200)
    description : string;

    @Field(type => Restaurant)
    @ManyToOne(
        type => Restaurant,
        restaurant => restaurant.menu,
        { onDelete : 'CASCADE' },
    )
    restaurant : Restaurant;

    @RelationId((dish: Dish) => dish.restaurant)
    restaurantId : number;


    @Field(type => [DishOption], {nullable:true})
    @Column( {type: 'json', nullable:true} )
    options? : DishOption[]

}