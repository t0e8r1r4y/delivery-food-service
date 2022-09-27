import { Args, Int, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { RestaurantService } from "../application/service/restaurants.service";
import { CategoryEntity } from "../infra/db/entities/category.entity";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";

// @TODO - 구현 내용은 적지만 해당 내용 구분이 필요함
@Resolver(of => CategoryEntity)
export class CategoryResolver {
    constructor(private readonly restaurantService : RestaurantService) {}

    @ResolveField( type => Int )
    restaurantCount(@Parent() category : CategoryEntity ) : Promise<number> { // add cal logic
        console.log(category);
        return this.restaurantService.countRestaurants(category);
    }

    // 카테고리 전체 조회
    @Query(tpye => AllCategoriesOutput)
    allCategories() : Promise<AllCategoriesOutput> { 
        return this.restaurantService.allCategories()
    }

    @Query(type => CategoryOutput)
    category(@Args('input') categoryInput:CategoryInput) : Promise<CategoryOutput> {
        return this.restaurantService.findCategoryBySlug(categoryInput);
    } 
}