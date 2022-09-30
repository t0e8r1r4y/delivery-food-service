import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishEntity } from '../restaurants/infra/db/entities/dish.entitiy';
import { RestaurantEntity } from '../restaurants/infra/db/entities/restaurant.entity';
import { OrderItem } from './infra/db/entities/order-item.entity';
import { Order } from './infra/db/entities/order.entity';
import { OrderService } from './application/order.service';
import { OrderResolver } from './interface/orders.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([Order, RestaurantEntity, OrderItem, DishEntity])],
    providers: [
        OrderService, OrderResolver
    ]
})
export class OrdersModule {}
