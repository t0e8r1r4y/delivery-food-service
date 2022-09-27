import { CustomRepository } from "../../../../common/class-decorator.ts/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { CategoryEntity } from "../entities/category.entity";
import { ICategoryRepository } from "../../../../restaurants/domain/repository/icategory.repository";
import { TryCatch } from "../../../../common/method-decorator/trycatch.decorator";

@CustomRepository(CategoryEntity)
export class CategoryRepository extends Repository<CategoryEntity> implements ICategoryRepository{
    
    @TryCatch('/CategoryRepository/createCategory')
    async createCategory(
        slug: string, name: string
    ) : Promise<CategoryEntity> {
        const category = this.create({
            slug : slug,
            name : name,
        });

        if(!category) {
            throw new Error('/카테고리를 정상 생성하지 못했습니다.')
        }
        return category;
    }

    @TryCatch('/CategoryRepository/saveCategory')
    async saveCategory(
        category: CategoryEntity
    ) : Promise<CategoryEntity> {

        let saveCategory : CategoryEntity = null;
        let errorMag : string = null;

        const queryRunner = await this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            saveCategory = await queryRunner.manager.save(category);
        } catch (error) {
            errorMag = error.message;
        } finally {
            await queryRunner.release();
        }

        if(errorMag !== null) {
            throw new Error('/'+errorMag);
        }

        return saveCategory;
    }

    @TryCatch('/CategoryRepository/rollbackTransaction')
    async rollbackTransaction() : Promise<boolean> {
        let errorMag : string = null;

        const queryRunner = await this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.rollbackTransaction();
        } catch (error) {
            errorMag = error.message;
        } finally {
            await queryRunner.release();
        }

        if(errorMag !== null) {
            throw new Error('/'+errorMag);
        }

        return true;
    }

    @TryCatch('/CategoryRepository/commitTransaction')
    async commitTransaction() : Promise<boolean> {
        let errorMag : string = null;

        const queryRunner = await this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            errorMag = error.message;
        } finally {
            await queryRunner.release();
        }

        if(errorMag !== null) {
            throw new Error('/'+errorMag);
        }

        return true;
    }

    @TryCatch('/CategoryRepository/getOneCategoryBySlug')
    async getOneCategoryBySlug(
        categorySlug: string
    ) : Promise<CategoryEntity> {

        const category = await this.findOne({
            where : {
                slug : categorySlug,
            }
        });

        if(!category) {
            throw new Error("/조회한 카테고리가 없습니다.");
        }

        return category;
    }

    @TryCatch('/CategoryRepository/getAllCategory')
    async getAllCategory() : Promise<CategoryEntity[]> {
        const categories = await this.find();
        if(!categories) {
            throw new Error("/카테고리를 찾을 수 없습니다.");
        }
        return categories;
    }

    @TryCatch('/CategoryRepository/deleteCategory')
    async deleteCategory(
        category: CategoryEntity
    ) : Promise<boolean> {
        let errorMag : string = null;

        const queryRunner = await this.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.delete( CategoryEntity , category.id);
        } catch (error) {
            errorMag = error.message;
        } finally {
            await queryRunner.release();
        }

        if(errorMag !== null) {
            throw new Error('/'+errorMag);
        }

        return true;
    }
    

}