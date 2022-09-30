import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "../../../../common/entities/core.entity";
import { RestaurantEntity } from "../../../../restaurants/infra/db/entities/restaurant.entity";
import { UserEntity } from "../../../../users/infra/db/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { OrderItem } from "./order-item.entity";
import { IsEnum, IsNumber } from "class-validator";

export enum OrderStatus {
    Pending = 'Pending',
    Cooking = 'Cooking',
    Cooked = 'Cooked',
    PickedUp = 'PickedUp',
    Delivered = 'Delivered',
}

registerEnumType( OrderStatus, {name: 'OrderStatus'} );

@InputType('OrderInputType', { isAbstract: true } )
@ObjectType()
@Entity('order')
export class Order extends CoreEntity {
    
    @Field(type => UserEntity, {nullable: true})
    @ManyToOne(
        type => UserEntity,
        user => user.orders,
        { onDelete: 'SET NULL', nullable:true, eager: true }
    )
    customer? : UserEntity;

    @RelationId((order : Order) => order.customer )
    customerId? : number;

    @Field( type => UserEntity, {nullable:true} )
    @ManyToOne(
        type => UserEntity,
        user => user.riders,
        { onDelete: 'SET NULL', nullable:true, eager: true }
    )
    driver?: UserEntity;

    @RelationId((order : Order) => order.driver )
    driverId? : number;

    @Field(type => RestaurantEntity, { nullable:true })
    @ManyToOne(
        type => RestaurantEntity,
        restaurant => restaurant.orders,
        { onDelete: 'SET NULL', nullable: true, eager: true }
    )
    restaurant?: RestaurantEntity;

    @Field(type => [OrderItem])
    @ManyToMany(type => OrderItem)
    @JoinTable()
    items: OrderItem[];

    @Column({nullable:true})
    @Field(type => Float)
    @IsNumber()
    total: number;

    @Column({type: 'enum', enum: OrderStatus, default:OrderStatus.Pending})
    @Field(type => OrderStatus)
    @IsEnum(OrderStatus)
    status : OrderStatus;
}