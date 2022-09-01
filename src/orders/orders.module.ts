import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { OrderResolver } from './orders.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Restaurant])],
    providers: [
        OrderService, OrderResolver
    ]
})
export class OrdersModule {}
