import { Injectable } from "@nestjs/common";
import { Response } from "express";



@Injectable()
export class EventSseGateway {
    private clients: Response[] = []

    addClient(res: Response){
        this.clients.push(res)
        res.on('close', () => {
            this.clients = this.clients.filter(client => client !== res)
        })
    }

    notifyEventActivated(event: any){
        for(const client of this.clients) {
            client.write(`data: ${JSON.stringify(event)}\n\n`)
        }
    }
}