import { CategoryEntity } from "../../../restaurants/infra/db/entities/category.entity";

export class ICategoryRepository {
       // create
       createCategory : ( slug : string, name : string ) => Promise<CategoryEntity>;
       // save
       saveCategory : ( category : CategoryEntity ) => Promise<CategoryEntity>;
       // rollback
       rollbackTransaction : () => Promise<boolean>;
       // commit
       commitTransaction : () => Promise<boolean>;
       // findOne ( restaurantId, )
       getOneCategoryBySlug : ( categorySlug : string ) => Promise<CategoryEntity>;
       // findAll
       getAllCategory : () => Promise<CategoryEntity[]>;
       // delete
       deleteCategory : ( category: CategoryEntity ) => Promise<boolean>;
}