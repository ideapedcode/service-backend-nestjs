import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from '../../category/schemas/category.schema';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
  category!: Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  stock!: number;

  @Prop()
  imageUrl?: string;
}

export type ProductDocument = Product & Document;

export const ProductSchema = SchemaFactory.createForClass(Product);
