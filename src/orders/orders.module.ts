import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from '../restaurants/infra/db/entities/dish.entitiy';
import { RestaurantEntity } from '../restaurants/infra/db/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { OrderResolver } from './orders.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([Order, RestaurantEntity, OrderItem, Dish])],
    providers: [
        OrderService, OrderResolver
    ]
})
export class OrdersModule {}
