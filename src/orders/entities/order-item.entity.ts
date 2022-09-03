import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "../../common/entities/core.entity";
import { Dish, DishChoice } from "../../restaurants/entities/dish.entitiy";
import { Column, Entity, ManyToOne } from "typeorm";

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
    @Field(type=> String)
    name : string;
    @Field(type=> String, {nullable: true})
    choice?: String;
}

@InputType('OrderItemInputType', {isAbstract:true})
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
    
    @Field(type => Dish)
    @ManyToOne(
        type=> Dish, 
        {nullable:true, onDelete: 'CASCADE'}
    )
    dish: Dish;

    @Field(type=>[OrderItemOption], {nullable: true})
    @Column({type: 'json', nullable: true})
    options? : [OrderItemOption];
}