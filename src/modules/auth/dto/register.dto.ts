import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@server.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'user default' })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'StrongPassword123' })
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  role!: string;
}
