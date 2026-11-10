import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class EditInfoDto {

    @IsString()
    @IsNotEmpty()
    full_name: string;

}