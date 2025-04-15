import { Controller, Get, Post, Body, Param, HttpStatus, HttpCode, UploadedFiles, UseInterceptors, ParseFilePipe, BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { PrizeService } from './prize.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { QrCodeService } from './qrcode.service';
import { EventEntity } from './entities/event.entity';
import { Event } from '@prisma/client';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

@Controller('events')
@ApiTags('Events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly prizeService: PrizeService,
    private qrCodeService: QrCodeService
  ) { }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: EventEntity, isArray: true })
  @Get("all")
  async getEvents(@CurrentUser() user): Promise<Event[]> {
    const userId = await user.userId
    return this.eventsService.findAllEventsByUser(userId)
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: EventEntity })
  @Get(":eventId")
  async getEvent(@CurrentUser() user, @Param('eventId') eventId: string): Promise<Event> {
    const userId = await user.userId
    return this.eventsService.findOneEventByUser(eventId, userId)
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: EventEntity })
  @Post('create')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'prizeImages', maxCount: 10 } // Single field for all prize images
  ]))
  async createEvent(
    @CurrentUser() user,
    @Body() createEvent: any, // Temporarily use any to parse the body manually
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false
      })
    ) files: { prizeImages?: Express.Multer.File[] }
  ): Promise<Event> {
    const userId = await user.userId;
    
    // Parse the event data
    const eventData: CreateEventDto = {
      name: createEvent.title,
      description: createEvent.description,
      date: new Date(createEvent.date),
      eventStartTime: new Date(createEvent.eventStartTime),
      eventEndTime: new Date(createEvent.eventEndTime),
      qrCodeValidityDuration: parseInt(createEvent.qrCodeValidityDuration),
      status: createEvent.status,
      prizes: []
    };

    // Parse prizes array safely
    if (createEvent.prizes) {
      let prizesData;
      try {
        // Handle both string and array cases
        prizesData = typeof createEvent.prizes === 'string' 
          ? JSON.parse(createEvent.prizes)
          : createEvent.prizes;

        eventData.prizes = prizesData.map((prize: any, index: number) => ({
          name: prize.name,
          description: prize.description,
          quantity: parseInt(prize.quantity.toString()),
          status: "AVAILABLE",
          image: files?.prizeImages?.[index],
          eventId: "" // This will be set by the service
        }));
      } catch (error) {
        throw new BadRequestException('Invalid prizes data format');
      }
    }
    
    return await this.eventsService.newEvent(eventData, userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post(":eventId/generate-qr")
  async generateQrCode(@Param("eventId") eventId: string) {
    return await this.qrCodeService.generateQrCode(eventId)
  }

  @HttpCode(HttpStatus.OK)
  @Post(":eventId/qrcode/:uniqueCode")
  async processScannedQrCode(
    @Param("eventId") eventId: string,
    @Param("uniqueCode") uniqueCode: string
  ) {
    return await this.qrCodeService.processScannedQrCode(uniqueCode, eventId)
  }

  @HttpCode(HttpStatus.OK)
  @Get(":id/status")
  async getEventStatus(@Param("id") id: string) {
    return this.eventsService.getEventStatus(id)
  }

  @HttpCode(HttpStatus.OK)
  @Get(":id/active-qr")
  async getActiveQr(@Param("id") id: string) {
    return this.eventsService.getActiveQrCode(id)
  }
}
