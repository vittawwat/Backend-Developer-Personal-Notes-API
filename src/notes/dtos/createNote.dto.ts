import {IsString, IsNotEmpty, MaxLength, MinLength, IsBoolean, IsOptional, } from 'class-validator';

export class CreateNoteDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(200)
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsOptional()
    @IsBoolean()
    is_pinned: boolean = false;
}