import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getItems(@Request() req: AuthenticatedRequest) {
    return this.cartService.getItems(req.user.userId);
  }

  @Post()
  async addItem(@Request() req: AuthenticatedRequest, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.userId, dto);
  }

  @Delete(':id')
  async removeItem(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.cartService.removeItem(req.user.userId, id);
    return { success: true };
  }
}
