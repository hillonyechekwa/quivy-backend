import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, UseInterceptors, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { AnyFilesInterceptor, FilesInterceptor} from '@nestjs/platform-express';
import { PrizesService } from './prizes.service';
import { UploadedFiles } from '@nestjs/common';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { Logger } from '@nestjs/common';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { CreatePrizesDto } from './dto/create-prizes.dto';
import { Express } from 'express';
// import { UpdatePrizeDto } from './dto/update-prize.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('prizes')
@ApiTags('Prizes')
export class PrizesController {
  private readonly logger = new Logger(PrizesController.name);
  constructor(
    private readonly prizesService: PrizesService,
    private readonly fileUploadService: FileUploadService
  ) { }
  
  @HttpCode(HttpStatus.OK)
  @Get(":eventId")
  async getPrizes(@Param("eventId") eventId: string){
    return await this.prizesService.getPrizes(eventId)
  }

  @HttpCode(HttpStatus.OK)
  @Post('create/:eventId')
  async create(@Body() createPrizeDto: CreatePrizeDto, @Param('eventId') eventId) {
    return await this.prizesService.createSinglePrize(createPrizeDto, eventId);
  }


  @HttpCode(HttpStatus.OK)
  @Post('create-many/:eventId')
  @UseInterceptors(AnyFilesInterceptor({preservePath: true}))
  async createMany(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body: { prizes: Array<{
      name: string
      description: string
      quantity: string
    }>}, @Param('eventId') eventId: string) {
  

       console.log('parsed body', body)
    // console.log('Raw body keys:', Object.keys(body));
    // console.log('Files fieldnames:', files.map(f => f.fieldname));
    try {
      const prizeData: CreatePrizesDto = {
        prizes: []
      }

      if (!Array.isArray(body.prizes)) {
        throw new BadRequestException('Invalid prizes format - expected array');
      }

      prizeData.prizes = await Promise.all(
        body.prizes.map(async (prize: any, index: number) => {
          // Find corresponding image file using the index
          const image = files.find(file => 
            file.fieldname === `prizes[${index}][image]`
          );

          console.log(`Processing prize ${index} image:`, image);

          let uploadedImageUrl: string | null = null;
          if (image) {
            const prizeUploadResult = await this.fileUploadService.uploadFileToSupabase(image, "prizes");
            uploadedImageUrl = prizeUploadResult?.url || null;
          }

          // Validate and parse quantity
          const quantity = parseInt(prize.quantity, 10);
          if (isNaN(quantity)) {
            throw new BadRequestException(`Invalid quantity for prize ${index}`);
          }

          return {
            name: prize.name,
            description: prize.description,
            quantity,
            imageUrl: uploadedImageUrl
          };
        })
      );
      
      // for (let i = 0; body[`prizes[${i}][name]`]; i++) {
      //   const name = body[`prizes[${i}][name]`];
      //   const description = body[`prizes[${i}][description]`];
      //   const quantity = parseInt(body[`prizes[${i}][quantity]`], 10);
      //   const image = files.find(file => file.fieldname === `prizes[${i}][image]`);

      //   console.log('image', image)

      //   let uploadedImageUrl: string | null = null;
      //   if (image) {
      //     const prizeUploadResult = await this.fileUploadService.uploadFileToSupabase(image, "prizes")
      //     uploadedImageUrl = prizeUploadResult?.url
      //   }

      //   prizeData.prizes.push({ name, description, quantity, imageUrl: uploadedImageUrl })
      // }

      // console.log("recieved prizes", prizeData.prizes)
      this.logger.log(prizeData, "prizeData")
      return await this.prizesService.createManyPrizes(prizeData, eventId);
    }catch (error) {
      console.error('Error creating prizes:', error);
      throw new InternalServerErrorException('Failed to create prizes');
    }
  }
  
}
