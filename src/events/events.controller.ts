import { Controller, Get, Post, Body, Param, HttpStatus, HttpCode, UploadedFiles, UseInterceptors, ParseFilePipe, BadRequestException, Res, NotFoundException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { EventEntity } from './entities/event.entity';
import { Event } from '@prisma/client';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@Controller('events')
@ApiTags('Events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly config: ConfigService
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
  @Get(":id/status")
  async getEventStatus(@Param("id") id: string) {
    return this.eventsService.getEventStatus(id)
  }


  // @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({ type: EventEntity })
  // @Post('create')
  // @UseInterceptors(FileFieldsInterceptor([
  //   { name: 'prizeImages', maxCount: 10 } // Single field for all prize images
  // ]))
  // async createEvent(
  //   @CurrentUser() user,
  //   @Body() createEvent: any,
  //   @UploadedFiles(
  //     new ParseFilePipe({
  //       fileIsRequired: false
  //     })
  //   ) files: { prizeImages?: Express.Multer.File[] }
  // ): Promise<Event> {
  //   const userId = await user.userId;
    
  //   if (!createEvent.name && !createEvent.title) {
  //     throw new BadRequestException('Event name is required');
  //   }
    
  //   // Parse the event data
  //   const eventData: CreateEventDto = {
  //     name: createEvent.name || createEvent.title, // Use name if provided, fall back to title
  //     description: createEvent.description,
  //     date: new Date(createEvent.date),
  //     eventStartTime: new Date(createEvent.eventStartTime),
  //     eventEndTime: new Date(createEvent.eventEndTime),
  //     qrCodeValidityDuration: parseInt(createEvent.qrCodeValidityDuration),
  //     status: createEvent.status,
  //     prizes: []
  //   };

  //   // Parse prizes array safely
  //   if (createEvent.prizes) {
  //     try {
  //       // Handle both string and array cases
  //       const prizesData = typeof createEvent.prizes === 'string' 
  //         ? JSON.parse(createEvent.prizes)
  //         : createEvent.prizes;

  //       eventData.prizes = prizesData.map((prize: any, index: number) => ({
  //         name: prize.name,
  //         description: prize.description,
  //         quantity: parseInt(prize.quantity.toString()),
  //         status: "AVAILABLE",
  //         image: files?.prizeImages?.[index],
  //         eventId: "" // This will be set by the service
  //       }));
  //     } catch (error) {
  //       throw new BadRequestException('Invalid prizes data format');
  //     }
  //   }

  //   console.log('createEventData', eventData)
    
  //   const newEvent = await this.eventsService.newEvent(eventData, userId);
  //   console.log('newEvent', newEvent)
  //   return newEvent
  // }
  
  
  @HttpCode(HttpStatus.OK)
  @Post('create')
  async createNewEvent(@CurrentUser() user, @Body() createEvent: CreateEventDto): Promise<Event>{
    console.log('body', createEvent)
    const userId = user.userId
    return await this.eventsService.newEvent(createEvent, userId)
  }

  @HttpCode(HttpStatus.OK)
  @Get("scan/:code")
  async generateQrCode(@Param("code") code: string, @Res() res){
    const event = await this.eventsService.findByCode(code)
    if(!event) throw new NotFoundException("Event not found")
    
    const isWinner = await this.eventsService.getResults(event.id)

    const message = isWinner.result ? `Congratulations, you won a ${isWinner.prize}` : `Sorry, you didn't win anything`
    const frontendUrl = await this.config.get('FRONTEND_URL')
    return res.redirect(302, `${frontendUrl}/results/${event.id}?message=${encodeURIComponent(message)}`)
  }
 
}
