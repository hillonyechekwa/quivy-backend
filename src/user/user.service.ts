import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from "@prisma/client"
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }



  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.findByEmail(createUserDto.email)

    if (userExists !== null) throw new ConflictException("User Already Exists")
    
    
    try {
      const salt = await bcrypt.genSalt()
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt)
      createUserDto.password = hashedPassword

      const user = await this.prisma.user.create({
        data: createUserDto
      })

      delete user.password

      return user
    } catch (error) {
      console.error(error)
      throw new BadRequestException("user could not be crerated")
    }
  }

  // findAll() {
  //   return `This action returns all user`;
  // }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id
      }
    })

    if(!user) throw new UnauthorizedException("User not found!!")

    return user
  }

  async findOneAuth(data: Partial<User>): Promise<User>{
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email
      }
    })
    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        email
      }
    })

    return user
  }

  async findById(id: string):Promise<User>{
    const user = await this.prisma.user.findUnique({
      where: {
        id
      }
    })

    return user
  }

  async updateHashedRefreshToken(userId: string, hashedToken: string) {
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        hashedRefreshToken: hashedToken
      }
    })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
