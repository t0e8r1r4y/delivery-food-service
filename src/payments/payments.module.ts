import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from '../restaurants/infra/db/entities/restaurant.entity';
import { Payment } from './entities/payment.entity';
import { PaymentResolver } from './payments.resolver';
import { PaymentService } from './payments.service';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, RestaurantEntity])],
    providers: [PaymentService, PaymentResolver]
})
export class PaymentsModule {}
