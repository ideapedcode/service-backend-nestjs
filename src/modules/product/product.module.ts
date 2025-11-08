import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { Category, CategorySchema } from '../category/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const destination = configService.get<string>('app.storagePath') ?? 'uploads';
        return {
          storage: diskStorage({
            destination,
            filename: (_req, file, cb) => {
              const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
              cb(null, `${uniqueSuffix}-${file.originalname}`);
            },
          }),
        };
      },
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService, MongooseModule],
})
export class ProductModule {}
