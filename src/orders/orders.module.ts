import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishEntity } from '../restaurants/infra/db/entities/dish.entitiy';
import { RestaurantEntity } from '../restaurants/infra/db/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { OrderResolver } from './orders.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([Order, RestaurantEntity, OrderItem, DishEntity])],
    providers: [
        OrderService, OrderResolver
    ]
})
export class OrdersModule {}
