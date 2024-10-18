import { IsString } from "class-validator";

export class ProsConsDisusserDto{

    @IsString()
    readonly prompt: string;
}