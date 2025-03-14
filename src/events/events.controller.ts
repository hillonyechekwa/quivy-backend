import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { QrCodeService } from './qrcode.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private qrCodeService: QrCodeService
  ) { }

  @Get("events")
  async getEvents(@CurrentUser() user) {
    const userId = await user.userId
    return this.eventsService.findAllEventsByUser(userId)
  }

  @Get("event/:eventId")
  async getEvent(@CurrentUser() user, @Param('eventId') eventId: string) {
    return this.eventsService.findOneEvent(eventId)
  }

  @Post('create-event')
  async createEvent(@CurrentUser() user, @Body() createEvent: CreateEventDto) {
    const userId = await user.userId
    return await this.eventsService.newEvent(createEvent, userId)
  }

  @Post(":id/generate-qr")
  async generateQrCode(@Param("id") id: string) {
    return await this.qrCodeService.generateQrCode(id)
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
