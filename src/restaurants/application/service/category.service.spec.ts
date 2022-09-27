import { Test } from "@nestjs/testing";
import { CategoryEntity } from "src/restaurants/infra/db/entities/category.entity";
import { CategoryRepository } from "src/restaurants/infra/db/repository/category.repository";
import { CategoryService } from "./category.service";


type MockRepository = Partial< Record < keyof CategoryRepository, jest.Mock > >;

describe('Category Service Test', () => {

    let categoryService : CategoryService;
    let categoryRepository : MockRepository;

    const mockDataCategory : CategoryEntity = {
        name: "korean Food",
        coverImage: "https://test/location/koranFood",
        slug: "koreanfood",
        restaurants: [],
        id: 1,
        createdAt: new Date('2022-09-02 11:22:22.891575'),
        updatedAt: new Date('2022-09-02 11:22:22.891575')
    }

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                CategoryService,
                {
                    provide : CategoryRepository,
                    useValue : {
                        createCategory : jest.fn(),
                        saveCategory : jest.fn(),
                        getOneCategoryBySlug : jest.fn(),
                        commitTransaction : jest.fn(),
                        rollbackTransaction : jest.fn(),
                        getAllCategory : jest.fn(),
                        deleteCategory : jest.fn(),
                    }
                }
            ]
        }).compile();

        categoryRepository = module.get(CategoryRepository);
        categoryService = module.get(CategoryService);
    })

    /**
     * Test 'getOrCreateCategory Method'
     */
    it('getOrCreateCategory method should return Entity and generate new category', async () => {
        categoryRepository.createCategory.mockReturnValue(mockDataCategory);
        categoryRepository.saveCategory.mockReturnValue(mockDataCategory);
        categoryRepository.getOneCategoryBySlug.mockReturnValue(null);

        const category = await categoryService.getOrCreateCategory(mockDataCategory.name);

        expect(category).toEqual(mockDataCategory);
        expect(categoryRepository.createCategory).toBeCalledTimes(1);
        expect(categoryRepository.saveCategory).toBeCalledTimes(1);
        expect(categoryRepository.getOneCategoryBySlug).toBeCalledTimes(1);
    });

    it('getOrCreateCategory method should return Entity and get entity', async () => {
        categoryRepository.createCategory.mockReturnValue(mockDataCategory);
        categoryRepository.saveCategory.mockReturnValue(mockDataCategory);
        categoryRepository.getOneCategoryBySlug.mockReturnValue(mockDataCategory);

        const category = await categoryService.getOrCreateCategory(mockDataCategory.name);

        expect(category).toEqual(mockDataCategory);
        expect(categoryRepository.createCategory).toBeCalledTimes(0);
        expect(categoryRepository.saveCategory).toBeCalledTimes(0);
        expect(categoryRepository.getOneCategoryBySlug).toBeCalledTimes(1);
    });

    it('getOrCreateCategory method should return fail becasue it should fail to create Entity.', async () => {
        categoryRepository.createCategory.mockRejectedValue(
            new Error('/Fail to create category.'),
        )
        categoryRepository.saveCategory.mockReturnValue(mockDataCategory);
        categoryRepository.getOneCategoryBySlug.mockReturnValue(null);

        const category = await categoryService.getOrCreateCategory(mockDataCategory.name);

        expect(category).toEqual({"error": "/CategoryService/getOrCreateCategory/Fail to create category.", "ok": false});
        expect(categoryRepository.createCategory).toBeCalledTimes(1);
        expect(categoryRepository.saveCategory).toBeCalledTimes(0);
        expect(categoryRepository.getOneCategoryBySlug).toBeCalledTimes(1);
    });

    it('getOrCreateCategory method should return fail becasue it should fail to save Entity.', async () => {
        categoryRepository.saveCategory.mockRejectedValue(
            new Error('/Fail to save category.'),
        )
        categoryRepository.createCategory.mockReturnValue(mockDataCategory);
        categoryRepository.getOneCategoryBySlug.mockReturnValue(null);

        const category = await categoryService.getOrCreateCategory(mockDataCategory.name);

        expect(category).toEqual({"error": "/CategoryService/getOrCreateCategory/Fail to save category.", "ok": false});
        expect(categoryRepository.createCategory).toBeCalledTimes(1);
        expect(categoryRepository.saveCategory).toBeCalledTimes(1);
        expect(categoryRepository.getOneCategoryBySlug).toBeCalledTimes(1);
    });

}); 