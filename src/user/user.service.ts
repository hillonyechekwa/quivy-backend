import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, AccountStatus } from "@prisma/client"
import * as bcrypt from 'bcrypt'
import { NewProfileDto } from './dto/new-profile.dto';

import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';


@Injectable()
export class UserService {

  private supabase: SupabaseClient

  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {
    this.supabase = createClient(
      this.config.get<string>('SUPABASE_URL'),
      this.config.get<string>('SUPABASE_PUBLIC_KEY')
    )
   }
  
  async updateUserAccountStatus(userId: string) {
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        accountStatus: AccountStatus.ACTIVE
      }
    })
  }

  async validatePassword(password: string) {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt)
        password = hashedPassword

        return password
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.findByEmail(createUserDto.email)

    if (userExists !== null) throw new ConflictException("User Already Exists")
    
    

    try {
      if (!createUserDto.authProvider) {
       
        const userPassword = await this.validatePassword(createUserDto.password)


        const user = await this.prisma.user.create({
          data: {
            ...createUserDto,
            password: userPassword
          }
        })

        delete user.password

        return user
      }
      
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
    const user = await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        hashedRefreshToken: hashedToken
      }
    })
    return user
  }


  async updateEmailVerifiedAt(userId: string, date: Date) {
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        emailVerifiedAt: date
      }
    })
  }

  async updateUserPassword(password: string, userId: string) {
    return await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        password
      }
    })
  }

  async createUserProfile(profileData: NewProfileDto, userId: string) {
    const profile = await this.prisma.profile.create({
      data: {
        ...profileData,
        user: {
          connect: { id: userId }
        }
      }
    })
  }

  async checkSupabaseBucket(bucketName: string, isPublic: boolean = true) {
      const {data: buckets, error: listError} = await this.supabase.storage.listBuckets()

    if (listError) {
      throw new Error("failed to list buckets")
    }

    const bucketExists = buckets.some(bucket => bucket.name === bucketName)

    if (!bucketExists) {
      const { error: createError } = await this.supabase.storage.createBucket(bucketName, {
        public: isPublic
      })

      if (createError) {
        throw new Error("failed to create bucket")
      }
    }
  }

  async uploadProfileImg(file: Express.Multer.File, bucket:string, userId: string) {
    if (!file) {
      throw new BadRequestException('No file provided')
    }

    const fileExt = file.originalname.split('.').pop()
    const fileName = `${nanoid()}.${fileExt}`
    const filePath = `${Date.now()}_${fileName}`


    const { data, error } = await this.supabase
      .storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600'
                                      })


    if (error) {
      throw new BadRequestException(error.message)      
    }

    const {data: { publicUrl } } = await this.supabase.storage.from(bucket).getPublicUrl(filePath)

    await this.prisma.profile.update({
      where: {
        userId
      },
      data: {
        profileImageUrl: publicUrl
      }
    })


    return {
      path: filePath,
      url: publicUrl,
      size: file.size,
      mimeType: file.mimetype
    }
  }

  async getUserProfile(userId: string) {
    return await this.prisma.profile.findUnique({
      where: {
        userId
      }
    })
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
