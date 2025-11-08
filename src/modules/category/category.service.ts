import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(@InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>) {}

  /**
   * Creates a new product category to organize the catalog.
   */
  async create(dto: CreateCategoryDto): Promise<Category> {
    return this.categoryModel.create(dto);
  }

  /**
   * Returns all categories for browsing and filtering.
   */
  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  /**
   * Retrieves a single category by identifier.
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  /**
   * Applies updates to an existing category.
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  /**
   * Deletes a category.
   */
  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Category not found');
    }
  }
}
