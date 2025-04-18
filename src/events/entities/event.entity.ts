import {ApiProperty} from "@nestjs/swagger"
import {Event, QrCode, Winner, Prize, EventStatus} from "@prisma/client"


export class EventEntity implements Event {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  description: string

  @ApiProperty()
  date: Date

  @ApiProperty()
  eventStartTime: Date

  @ApiProperty()
  eventEndTime: Date

  @ApiProperty()
  qrCodeValidityDuration: number

  @ApiProperty()
  activeQrCode: QrCode

  @ApiProperty()
  status: EventStatus

  @ApiProperty()
  uniqueCode: string

  @ApiProperty()
  winners: Winner[]

  @ApiProperty()
  prizes: Prize[]
 
  @ApiProperty()
  userId: string

  @ApiProperty()
  createdAt: Date
}
