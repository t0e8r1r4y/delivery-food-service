import { Injectable } from "@nestjs/common";
import { TryCatchService } from "../../../common/method-decorator/trycatch-transaction.decorator";
import { CategoryEntity } from "../../../restaurants/infra/db/entities/category.entity";
import { CategoryRepository } from "../../../restaurants/infra/db/repository/category.repository";

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepo : CategoryRepository,
    ) {}

    @TryCatchService('/CategoryService/getOrCreateCategory')
    async getOrCreateCategory( 
        name : string 
    ) : Promise<CategoryEntity> {
        // 문자에 관한 처리
        const categoryName = name.trim().toLowerCase();
        const categorySlug = categoryName.replace(/ /g, '-');
        // DB에서 조회
        let category = await this.categoryRepo.getOneCategoryBySlug(categorySlug);
        // 없으면 생성
        if(!category) {
            const newGenCategory = await this.categoryRepo.createCategory( categorySlug, categoryName );
            category = await this.categoryRepo.saveCategory(newGenCategory);
        }
        // 있으면 그대로 반환
        return category;
    }
}