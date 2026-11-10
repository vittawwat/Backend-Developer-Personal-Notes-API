import {IsString, IsNotEmpty, MaxLength, MinLength, IsBoolean, IsOptional, } from 'class-validator';

export class EditNoteDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsBoolean()
    is_pinned?: boolean = false;
}