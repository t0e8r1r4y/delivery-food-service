import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "../../common/entities/core.entity";
import { DishEntity, DishChoice } from "../../restaurants/infra/db/entities/dish.entitiy";
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
    
    @Field(type => DishEntity)
    @ManyToOne(
        type=> DishEntity, 
        {nullable:true, onDelete: 'CASCADE'}
    )
    dish: DishEntity;

    @Field(type=>[OrderItemOption], {nullable: true})
    @Column({type: 'json', nullable: true})
    options? : [OrderItemOption];
}