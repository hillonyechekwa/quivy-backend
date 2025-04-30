import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "src/prisma/prisma.service";
import { EventStatus } from "@prisma/client";
import { EventSseGateway } from "../sse/event-sse.gateway";


@Injectable()
export class EventCronService {
    private readonly logger = new Logger(EventCronService.name)
    constructor(
        private prisma: PrismaService,
        private readonly sseGateway: EventSseGateway
    ) { }


    //TODO: remember to update this to use redis instead.
    @Cron(CronExpression.EVERY_MINUTE) // Check every minute
    async handleUpcomingEventsCron() {
        const now = new Date();

        // Fetch all upcoming events
        const events = await this.prisma.event.findMany({
            where: {
                status: EventStatus.UPCOMING,
            },
            select: { id: true, date: true, eventStartTime: true, name: true, userId: true},
        });

        // Filter events where the current time has passed the eventStartTime
        const toActivate = events.filter(evt => {
            const eventStartDateTime = new Date(
                `${evt.date.toISOString().slice(0, 10)}T${evt.eventStartTime.toISOString().slice(11, 19)}Z`
            );
            return eventStartDateTime <= now;
        });

        // Process in small batches to avoid database overload (throttling)
        const BATCH_SIZE = 10;
        let batchIndex = 0;

        const processNextBatch = async () => {
            const batch = toActivate.slice(batchIndex, batchIndex + BATCH_SIZE);

            if (batch.length === 0) {
                return;
            }

            // Update the status of these events to ACTIVE
            await this.prisma.event.updateMany({
                where: { id: { in: batch.map(e => e.id) } },
                data: { status: EventStatus.ACTIVE },
            });

            for(const event of batch){
                await this.prisma.notification.create({
                    data: {
                        userId: event.userId,
                        eventId: event.id,
                        title: `Event is live!`,
                        message: `Your event "${event.name}" is now active.`
                    }
                })
                
                this.sseGateway.notifyEventActivated({
                    userId: event.id,
                    id: event.id,
                    title: 'Event is live!',
                    message: `Your event "${event.name}" is now active`,
                    timeStamp: new Date()
                })
            }

            
                
            

            batchIndex += BATCH_SIZE;
            setTimeout(processNextBatch, 1000); // Throttling by waiting 1 second before processing the next batch
        };

        // Start the batch processing
        await processNextBatch();
    }

    // Cron job to handle events that should be closed once their eventEndTime has passed
    @Cron(CronExpression.EVERY_HOUR) // Run every hour
    async handleExpiredEventsCron() {
        const now = new Date();

        // Fetch active events where eventEndTime has passed
        const events = await this.prisma.event.findMany({
            where: {
                status: EventStatus.ACTIVE,
                eventEndTime: { lte: now }, // eventEndTime is less than or equal to the current time
            },
            select: { id: true, eventEndTime: true },
        });

        if (events.length === 0) {
            console.log('No events to close.');
            return;
        }

        // Process in small batches to avoid database overload (throttling)
        const BATCH_SIZE = 10;
        let batchIndex = 0;

        const processNextBatch = async () => {
            const batch = events.slice(batchIndex, batchIndex + BATCH_SIZE);

            if (batch.length === 0) {
                return;
            }

            // Update the status of these events to CLOSED
            await this.prisma.event.updateMany({
                where: { id: { in: batch.map(e => e.id) } },
                data: { status: EventStatus.CLOSED },
            });

            batchIndex += BATCH_SIZE;
            setTimeout(processNextBatch, 1000); // Throttling by waiting 1 second before processing the next batch
        };

        // Start the batch processing
        await processNextBatch();
    }
}
