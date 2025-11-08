import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Product } from '../../product/schemas/product.schema';
import { OrderStatus } from '../enums/order-status.enum';

type OrderItem = {
  product: Types.ObjectId;
  quantity: number;
  price: number;
};

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user!: Types.ObjectId;

  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: Product.name, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    _id: false,
  })
  items!: OrderItem[];

  @Prop({ required: true, min: 0 })
  total!: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Prop()
  shippingAddress?: string;
}

export type OrderDocument = Order & Document;

export const OrderSchema = SchemaFactory.createForClass(Order);
