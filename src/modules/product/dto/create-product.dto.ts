import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Noise cancelling over-ear headphones', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ example: '60f7b2f4f1a4c12b8c9e5a21' })
  @IsMongoId()
  category!: string;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
