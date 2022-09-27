import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from './infra/db/entities/category.entity';
import { DishEntity } from './infra/db/entities/dish.entitiy';
import { RestaurantEntity } from './infra/db/entities/restaurant.entity';
import { RestaurantResolver } from './interface/restaurants.resolver';
import { RestaurantService } from './application/service/restaurants.service';
import { RestaurantFactory } from './domain/restaurant.factory';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmCustomModule } from '../common/typeorm-ex.module';
import { CategoryRepository } from './infra/db/repository/category.repository';
import { RestaurantRepository } from './infra/db/repository/restaurant.repository';
import { DishRepository } from './infra/db/repository/dish.repository';
import { CategoryResolver } from './interface/category.resolver';
import { DishResolver } from './interface/dish.resolver';
import { CategoryService } from './application/service/category.service';

const commandHandlers = [];
const queryHandlers = [];
const factories = [
    RestaurantFactory,
];
const repositories = [];
const eventHandlers = [];


@Module({
    imports: [
        TypeOrmCustomModule.forCustomRepository([ CategoryRepository, RestaurantRepository, DishRepository  ]),
        TypeOrmModule.forFeature([RestaurantEntity, CategoryEntity, DishEntity]),
        CqrsModule,],
    providers: [
        RestaurantResolver, 
        CategoryResolver,
        DishResolver, 
        RestaurantService,
        CategoryService,
        ...commandHandlers,
        ...queryHandlers,
        ...factories,
        ...repositories,
        ...eventHandlers,
    ],
})
export class RestaurnatsModule {}
