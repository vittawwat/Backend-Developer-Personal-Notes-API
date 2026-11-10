import {
    Controller,
    Body,
    Param,
    Get,
    Post,
    Put,
    Delete,
    Req,
    UseGuards,
    Patch,
    UseInterceptors,
    BadGatewayException,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    HttpCode
} from '@nestjs/common';
import { UsersService } from './users.service'
import { User } from './user.entity'
import { AuthGuard } from '../guards/auth.guard';
import { EditInfoDto } from './dtos/editInfo.dto';
import { diskStorage, memoryStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { AVATAR_MAX_SIZE, avatarFilePipe } from './validators/avatar-file.pipe';
import { Unique } from 'typeorm';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { CurrentUser } from '../common/decorators/current-user.decorator';
// import { request } from 'http';


@Controller('users/me')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getProfile(@Req() request: any) {
        return await this.usersService.findOne(request.user.userId);
    }

    // update user
    @UseGuards(AuthGuard)
    @Patch()
    async editInfo(@Req() request: any, @Body() EditInfoData: EditInfoDto) {
        return await this.usersService.editInfo(request.user.userId, EditInfoData);
    }

    @UseGuards(AuthGuard)
    @Post('avatar')
    @HttpCode(200)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: "./uploads",
                filename: (req, file, callback) => {
                    const uniqueName = `${randomUUID()}${extname(file.originalname).toLowerCase()}`
                    callback(null, uniqueName)
                }
            }),
            limits: { fileSize: AVATAR_MAX_SIZE },
            fileFilter: (req, file, callback) => {
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
                if (!allowedTypes.includes(file.mimetype)) {
                    return callback(
                        new BadGatewayException("Only JPEG and PNG file are allowed"),
                        false
                    )
                }
                callback(null, true);
            }
        }),
    )
    async uploadAvatar(
        @CurrentUser() user: { userId: string },
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: true,
                validators: [new MaxFileSizeValidator({ maxSize: AVATAR_MAX_SIZE })],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.usersService.updateAvatar(user.userId, file);
    }

    @UseGuards(AuthGuard)
    @Delete('avatar')
    @HttpCode(204)
    async removeAvatar(@CurrentUser() user: { userId: string },) {
        return this.usersService.removeAvatar(user.userId);
    }






    // // get all user 
    // @Get()
    // async findAll() {
    //     return await this.usersService.findAll();
    // }

    // // get one user
    // @Get(':id')
    // async findOne(@Param('id') id: string) {
    //     return await this.usersService.findOne(id);
    // }

    // // create user
    // @Post()
    // async create(@Body() user: User) {
    //     return await this.usersService.create(user);
    // }

    // update user
    // @Put(':id')
    // async update(@Param('id') id: string, @Body() user: User) {
    //     return await this.usersService.update(id, user);
    // }

    // delete user
    // @Delete(':id')
    // async delete(@Param('id') id: string) {
    //     const user = await this.usersService.findOne(id);
    //     return this.usersService.delete(id);
    // }
}
