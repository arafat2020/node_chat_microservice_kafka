import { createZodDto } from "nestjs-zod";
import z from "zod";

export const CreateMessageSchema = z.object({
  content: z.string().min(1).optional(),
  fileUrl: z.url().optional(),
  channelId: z.uuid(),
  senderId: z.uuid(),
  serverId: z.uuid(),
});

export class CreateMessageDto extends createZodDto(CreateMessageSchema) {};