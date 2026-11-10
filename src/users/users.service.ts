import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { EditInfoDto } from './dtos/editInfo.dto';
import { promises as fs } from 'fs';
import { join } from 'path';

// const upload_dir = join(process.cwd(), 'uploads');

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    //getAllUser
    async findAll() {
        return await this.usersRepository.find();
    }

    //getOneUser
    async findOne(id: string) {
        const user = await this.usersRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_path,
            created_at: user.created_at,
            updated_at: user.updated_at
        };
    }
    //===================up load===================================//

    async updateAvatar(id: string, file: Express.Multer.File) {

        const user = await this.usersRepository.findOne({ where: { id } });

        if (!user) {
            await fs.unlink(file.path).catch(() => { });
            throw new NotFoundException('User not found')
        }

        const oldFilename = user.avatar_path;

        try {
            user.avatar_path = `uploads/${file.filename}`;
            await this.usersRepository.save(user);
        } catch (err) {
            await fs.unlink(file.path).catch(() => { });
            throw err;
        }

        // save สำเร็จแล้วค่อยลบรูปเก่า
        if (oldFilename) {
            await fs.unlink(oldFilename).catch(() => { });
        }

        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: `/${user.avatar_path}`,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }

    async removeAvatar(userId: string) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.avatar_path) {
            return;
        }

        const oldFilename = user.avatar_path;
        // console.log("funtion_delete oldFilename",oldFilename);
        
        if (oldFilename) {
            await fs.unlink(oldFilename).catch(() => { });
        }

        user.avatar_path = null;
        await this.usersRepository.save(user);
    }

    //create
    async create(user: User) {
        const newUser = this.usersRepository.create(user);
        return await this.usersRepository.save(newUser);
    }

    //editInfo user
    async editInfo(id: string, editInfoData: EditInfoDto) {
        const user = await this.findOne(id);

        if (!user) {
            throw new NotFoundException();
        }

        Object.assign(user, editInfoData)

        return await this.usersRepository.save(user);
    }

    //delete user
    async delete(id: string) {
        await this.usersRepository.delete(id);
    }
}
