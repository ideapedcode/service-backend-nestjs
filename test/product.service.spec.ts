import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductService } from '../src/modules/product/product.service';
import { Product } from '../src/modules/product/schemas/product.schema';
import { Category } from '../src/modules/category/schemas/category.schema';

const mockProductModel = () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
});

const mockCategoryModel = () => ({
  exists: jest.fn(),
});

describe('ProductService', () => {
  let service: ProductService;
  let productModel: ReturnType<typeof mockProductModel>;
  let categoryModel: ReturnType<typeof mockCategoryModel>;

  beforeEach(async () => {
    productModel = mockProductModel();
    categoryModel = mockCategoryModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: getModelToken(Product.name), useValue: productModel },
        { provide: getModelToken(Category.name), useValue: categoryModel },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  describe('create', () => {
    it('should create a product when category exists', async () => {
      categoryModel.exists.mockResolvedValue(true);
      productModel.create.mockResolvedValue({ id: 'prod-1', name: 'Test' });

      const result = await service.create({
        name: 'Test',
        description: 'Desc',
        price: 10,
        category: 'cat-id',
        stock: 5,
      }, 'uploads/test.png');

      expect(categoryModel.exists).toHaveBeenCalledWith({ _id: 'cat-id' });
      expect(productModel.create).toHaveBeenCalledWith({
        name: 'Test',
        description: 'Desc',
        price: 10,
        category: 'cat-id',
        stock: 5,
        imageUrl: 'uploads/test.png',
      });
      expect(result).toEqual({ id: 'prod-1', name: 'Test' });
    });

    it('should throw when category is invalid', async () => {
      await expect(
        service.create({
          name: 'Test',
          description: 'Desc',
          price: 10,
          category: 'invalid-id',
          stock: 5,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw when category is missing from database', async () => {
      categoryModel.exists.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'Test',
          description: 'Desc',
          price: 10,
          category: '507f1f77bcf86cd799439011',
          stock: 5,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a product when found', async () => {
      const exec = jest.fn().mockResolvedValue({ id: 'prod-1' });
      const populate = jest.fn().mockReturnValue({ exec });
      productModel.findById.mockReturnValue({ populate });

      const result = await service.findOne('prod-1');

      expect(productModel.findById).toHaveBeenCalledWith('prod-1');
      expect(populate).toHaveBeenCalledWith('category');
      expect(result).toEqual({ id: 'prod-1' });
    });

    it('should throw NotFoundException when product not found', async () => {
      const exec = jest.fn().mockResolvedValue(null);
      const populate = jest.fn().mockReturnValue({ exec });
      productModel.findById.mockReturnValue({ populate });

      await expect(service.findOne('unknown')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
