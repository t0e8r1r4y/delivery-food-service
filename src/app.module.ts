import { ApolloDriver } from '@nestjs/apollo';
import {  Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {  GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { UserEntity } from './users/infra/db/entities/user.entity';
import { CommonModule } from './common/common.module';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/infra/db/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurnatsModule } from './restaurants/restaurants.module';
import { Dish } from './restaurants/entities/dish.entitiy';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule'
import { HeadthCheckController } from './headth-check/headth-check.controller';
import { TerminusModule } from '@nestjs/terminus';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging: process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      entities: [UserEntity, Verification, Restaurant, Category, Dish, Order, OrderItem, Payment],
    }),
    GraphQLModule.forRootAsync( {
      driver: ApolloDriver,
      useFactory: () => ({
        installSubscriptionHandlers: true,
        autoSchemaFile: true,
        subscriptions: {
          'subscriptions-transport-ws': {
            onConnect: (connectionParams) => {
              const token = connectionParams['x-jwt'];
              return { token };
            },
          },
        },
        context: ({ req, connection }) => {
          return {
            token: req ? req.headers['x-jwt'] : connection.context['x-jwt'],
          };
        },
      }),
    } ),
    ScheduleModule.forRoot(),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain:process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL
    }),
    UsersModule,
    RestaurnatsModule,
    CommonModule,
    AuthModule,
    OrdersModule,
    PaymentsModule,
    TerminusModule,
    
  ],
  controllers: [HeadthCheckController],
  providers: [],
})
export class AppModule {}

