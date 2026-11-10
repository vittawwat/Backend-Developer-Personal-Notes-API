import {
    IsOptional, IsInt, Min, Max
    , IsBoolean, IsString, IsIn
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetNotesDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 20;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean()
    is_pinned?: boolean;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn(['created_at', '-created_at', 'title', '-title'])
    sort?: string = '-created_at';
} 