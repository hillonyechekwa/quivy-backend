import {ApiProperty} from "@nestjs/swagger"
import {Event, Winner, Prize, EventStatus} from "@prisma/client"


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
  qrCodeUrl: string

  @ApiProperty({default: EventStatus.DRAFTED})
  status: EventStatus

  @ApiProperty()
  uniqueCode: string

  @ApiProperty()
  scans: number

  @ApiProperty()
  clicks: number

  @ApiProperty()
  notifications: []

  @ApiProperty()
  winners: Winner[]

  @ApiProperty()
  prizes: Prize[]
 
  @ApiProperty()
  userId: string

  @ApiProperty()
  createdAt: Date
}
