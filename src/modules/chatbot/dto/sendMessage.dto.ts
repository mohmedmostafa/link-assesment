import {IsOptional, IsString} from "class-validator";
import {Type} from "class-transformer";

export class SendMessageDto {
    @IsOptional()
    @IsString()
    @Type(() => String)
    clientSocketId: string;

    @IsOptional()
    @IsString()
    @Type(() => String)
    text: string;

    clientId:string
}