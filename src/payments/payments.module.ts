import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from '../restaurants/infra/db/entities/restaurant.entity';
import { PaymentEntity } from './infra/db/entities/payment.entity';
import { PaymentResolver } from './interface/payments.resolver';
import { PaymentService } from './application/service/payments.service';

@Module({
    imports: [TypeOrmModule.forFeature([PaymentEntity, RestaurantEntity])],
    providers: [PaymentService, PaymentResolver]
})
export class PaymentsModule {}
