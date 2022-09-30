import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from '../../../../common/entities/core.entity';
import { RestaurantEntity } from '../../../../restaurants/infra/db/entities/restaurant.entity';
import { UserEntity } from '../../../../users/infra/db/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class PaymentEntity extends CoreEntity {
  @Field(type => String)
  @Column()
  transactionId: string;

  @Field(type => UserEntity)
  @ManyToOne(
    type => UserEntity,
    user => user.payments,
  )
  user: UserEntity;

  @RelationId((payment: PaymentEntity) => payment.user)
  userId: number;

  @Field(type => RestaurantEntity)
  @ManyToOne(type => RestaurantEntity)
  restaurant: RestaurantEntity;

  @Field(type => Int)
  @RelationId((payment: PaymentEntity) => payment.restaurant)
  restaurantId: number;
}