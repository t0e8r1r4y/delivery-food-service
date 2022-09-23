import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString, Length } from "class-validator";
import { CoreEntity } from "../../../../common/entities/core.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { RestaurantEntity } from "./restaurant.entity";

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field(type => String)
  name: string;
  @Field(type => Int, { nullable: true })
  extra?: number;
}

@InputType('DishOptionsInputType', {isAbstract:true})
@ObjectType()
export class DishOption {
    @Field(type => String)
    name : string

    @Field(type => [DishChoice], { nullable: true })
    choices?: DishChoice[];

    @Field(type=>Int, {nullable:true})
    extra?: number;
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

    @Field(type => RestaurantEntity)
    @ManyToOne(
        type => RestaurantEntity,
        restaurant => restaurant.menu,
        { onDelete : 'CASCADE' },
    )
    restaurant : RestaurantEntity;

    @RelationId((dish: Dish) => dish.restaurant)
    restaurantId : number;


    @Field(type => [DishOption], {nullable:true})
    @Column( {type: 'json', nullable:true} )
    options? : DishOption[]

}