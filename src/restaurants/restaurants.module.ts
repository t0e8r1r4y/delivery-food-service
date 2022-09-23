import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './infra/db/entities/category.entity';
import { Dish } from './infra/db/entities/dish.entitiy';
import { RestaurantEntity } from './infra/db/entities/restaurant.entity';
import { CategoryResolver, DishResolver, RestaurantResolver } from './interface/restaurants.resolver';
import { RestaurantService } from './application/service/restaurants.service';

@Module({
    imports: [TypeOrmModule.forFeature([RestaurantEntity, Category, Dish])],
    providers: [RestaurantResolver, CategoryResolver, DishResolver, RestaurantService],
})
export class RestaurnatsModule {}
