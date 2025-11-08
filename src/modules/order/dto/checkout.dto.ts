import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: '123 Main St, City', required: false })
  @IsOptional()
  @IsString()
  shippingAddress?: string;
}
