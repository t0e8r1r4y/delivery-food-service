import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "../../common/entities/core.entity";
import { Dish, DishOption } from "../../restaurants/entities/dish.entitiy";
import { Column, Entity, ManyToOne } from "typeorm";

@InputType('OrderItemInputType', {isAbstract:true})
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
    
    @ManyToOne(
        type=> Dish, 
        {nullable:true, onDelete: 'CASCADE'}
    )
    dish: Dish;

    @Field(type=>[DishOption], {nullable: true})
    @Column({type: 'json', nullable: true})
    options? : DishOption[];
}