import { BadRequestException, Injectable } from "@nestjs/common";
import { DbService } from "../../../lib/db/db.service";
import {CreateMessageDto, PromiseMapResponseGeneric} from "@node-chat/shared";

@Injectable()
export class CreateMessageService {
    constructor(
        private readonly dbService: DbService
    ) {}

    public async create(raw_data:CreateMessageDto):PromiseMapResponseGeneric<unknown> {
        try {
            const data = await this.dbService.message.create({
            data:{
                ...raw_data
            }
        });
            return {
                data,
                message: 'Message created successfully',
                success: true
            };
        } catch (error) {
             throw new BadRequestException(
              'Failed to update server \n`' + String(error)
            );
        }
    }
}