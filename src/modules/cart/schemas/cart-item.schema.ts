import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Product } from '../../product/schemas/product.schema';

@Schema({ timestamps: true })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  product!: Types.ObjectId;

  @Prop({ required: true, min: 1, default: 1 })
  quantity!: number;
}

export type CartItemDocument = CartItem & Document;

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
