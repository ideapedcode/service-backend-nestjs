import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CartService } from '../cart/cart.service';
import { Order, OrderDocument } from './schemas/order.schema';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderStatus } from './enums/order-status.enum';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly cartService: CartService,
  ) {}

  /**
   * Converts the authenticated customer's cart into a persisted order.
   */
  async checkout(userId: string, dto: CheckoutDto): Promise<Order> {
    const cartItems = await this.cartService.getItems(userId);
    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const items = cartItems.map((item) => {
      const product = item.product as unknown as { _id: Types.ObjectId; price: number };
      return {
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await this.orderModel.create({
      user: new Types.ObjectId(userId),
      items,
      total,
      shippingAddress: dto.shippingAddress,
      status: OrderStatus.PENDING,
    });

    await this.cartService.clearCart(userId);

    return order.populate('items.product');
  }

  /**
   * Lists orders for administrative review.
   */
  async findAll(): Promise<Order[]> {
    return this.orderModel.find().populate('items.product').populate('user').exec();
  }

  /**
   * Lists orders associated with a customer account.
   */
  async findForUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ user: userId })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Updates the status of an order; used by admin workflows.
   */
  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status: dto.status }, { new: true })
      .populate('items.product')
      .exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
