import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CartItem, CartItemDocument } from './schemas/cart-item.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Product, ProductDocument } from '../product/schemas/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(CartItem.name) private readonly cartItemModel: Model<CartItemDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  /**
   * Adds a product to the customer cart or increments the quantity when it already exists.
   */
  async addItem(userId: string, dto: AddToCartDto): Promise<CartItem> {
    const productExists = await this.productModel.exists({ _id: dto.productId });
    if (!productExists) {
      throw new NotFoundException('Product not found');
    }

    const existingItem = await this.cartItemModel
      .findOne({ user: userId, product: dto.productId })
      .exec();

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      return existingItem.save();
    }

    const cartItem = new this.cartItemModel({
      user: new Types.ObjectId(userId),
      product: new Types.ObjectId(dto.productId),
      quantity: dto.quantity,
    });
    return cartItem.save();
  }

  /**
   * Fetches the authenticated customer's cart items with product detail.
   */
  async getItems(userId: string): Promise<CartItemDocument[]> {
    return this.cartItemModel.find({ user: userId }).populate('product').exec();
  }

  /**
   * Removes a cart item belonging to the authenticated customer.
   */
  async removeItem(userId: string, cartItemId: string): Promise<void> {
    const removed = await this.cartItemModel
      .findOneAndDelete({ _id: cartItemId, user: userId })
      .exec();

    if (!removed) {
      throw new NotFoundException('Cart item not found');
    }
  }

  /**
   * Clears all cart items for a customer after checkout.
   */
  async clearCart(userId: string): Promise<void> {
    await this.cartItemModel.deleteMany({ user: userId }).exec();
  }
}
