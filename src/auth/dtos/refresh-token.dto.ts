import { IsString, isString } from "class-validator";

export class RefreshTokenDto {
    @IsString()
    refresh_token: string;
    
}