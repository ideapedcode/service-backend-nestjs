import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: '60f7b2f4f1a4c12b8c9e5a21' })
  @IsMongoId()
  productId!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity!: number;
}
