import { createZodDto } from "nestjs-zod";
import z from "zod";

export const CreateMessageSchema = z.object({
  content: z.string().min(1).optional(), // String?
  fileUrl: z.url().optional(),  // String?
  channelId: z.uuid(),
  senderId: z.uuid(),
});

export class CreateMessageDto extends createZodDto(CreateMessageSchema) {};