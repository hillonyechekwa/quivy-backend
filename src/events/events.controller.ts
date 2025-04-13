import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { EventsService } from './events.service';
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
    private qrCodeService: QrCodeService
  ) { }

  @ApiOkResponse({ type: EventEntity, isArray: true })
  @Get("events")
  async getEvents(@CurrentUser() user): Promise<Event[]> {
    const userId = await user.userId
    return this.eventsService.findAllEventsByUser(userId)
  }

  @ApiOkResponse({ type: EventEntity })
  @Get("event/:eventId")
  async getEvent(@CurrentUser() user, @Param('eventId') eventId: string): Promise<Event> {
    const userId = await user.userId
    return this.eventsService.findOneEventByUser(eventId, userId)
  }

  @ApiOkResponse({ type: EventEntity })
  @Post('create-event')
  async createEvent(@CurrentUser() user, @Body() createEvent: CreateEventDto): Promise<Event> {
    const userId = await user.userId
    return await this.eventsService.newEvent(createEvent, userId)
  }

  @Post(":eventId/generate-qr")
  async generateQrCode(@Param("eventId") eventId: string) {
    return await this.qrCodeService.generateQrCode(eventId)
  }

  @Post(":eventId/qrcode/:uniqueCode")
  async processScannedQrCode(
    @Param("eventId") eventId: string,
    @Param("uniqueCode") uniqueCode: string
  ) {
    return await this.qrCodeService.processScannedQrCode(uniqueCode, eventId)
  }


  @Get(":id/status")
  async getEventStatus(@Param("id") id: string) {
    return this.eventsService.getEventStatus(id)
  }

  @Get(":id/active-qr")
  async getActiveQr(@Param("id") id: string) {
    return this.eventsService.getActiveQrCode(id)
  }
}
