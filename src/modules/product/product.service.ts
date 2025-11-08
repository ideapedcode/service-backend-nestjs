import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category, CategoryDocument } from '../category/schemas/category.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const isValid = Types.ObjectId.isValid(categoryId);
    if (!isValid) {
      throw new BadRequestException('Invalid category identifier');
    }
    const exists = await this.categoryModel.exists({ _id: categoryId });
    if (!exists) {
      throw new NotFoundException('Category not found');
    }
  }

  /**
   * Creates a new product and stores the uploaded image path when available.
   */
  async create(dto: CreateProductDto, imageUrl?: string): Promise<Product> {
    await this.ensureCategoryExists(dto.category);
    return this.productModel.create({ ...dto, imageUrl });
  }

  /**
   * Lists all products for catalog browsing.
   */
  async findAll(): Promise<Product[]> {
    return this.productModel.find().populate('category').exec();
  }

  /**
   * Retrieves a single product by identifier.
   */
  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('category').exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  /**
   * Updates a product while preserving validation and image uploads.
   */
  async update(id: string, dto: UpdateProductDto, imageUrl?: string): Promise<Product> {
    if (dto.category) {
      await this.ensureCategoryExists(dto.category);
    }

    const product = await this.productModel
      .findByIdAndUpdate(
        id,
        { ...dto, ...(imageUrl ? { imageUrl } : {}) },
        { new: true },
      )
      .populate('category')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  /**
   * Removes a product from the catalog.
   */
  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }
}
