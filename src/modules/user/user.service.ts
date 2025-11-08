import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  /**
   * Persists a newly registered user record.
   */
  async create(payload: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel({
      ...payload,
      email: payload.email.toLowerCase(),
    });
    return createdUser.save();
  }

  /**
   * Retrieves all users for administrative insights.
   */
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  /**
   * Locates a single user by their unique identifier.
   */
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Locates a single user by their email for authentication workflows.
   */
  async findByEmail(email: string, includePassword = false): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  /**
   * Applies partial updates to an existing user record.
   */
  async update(id: string, payload: UpdateUserDto): Promise<UserDocument> {
    const data = {
      ...payload,
      ...(payload.email ? { email: payload.email.toLowerCase() } : {}),
    };
    if (payload.password) {
      data.password = await bcrypt.hash(payload.password, 10);
    }
    const updated = await this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return updated;
  }

  /**
   * Permanently deletes a user record.
   */
  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }
}
