import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { SignupDto } from './dtos/signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dtos/refresh-token.dto';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private Jwtservice: JwtService,
    ) { }

    async signUp(signupData: SignupDto) {
        const { email, password, full_name } = signupData;

        const emailInUse = await this.userRepository.findOne({ where: { email } });

        if (emailInUse) {
            throw new BadRequestException('Email already in use');
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = this.userRepository.create({
            email,
            password: hashPassword,
            full_name
        });

        await this.userRepository.save(user)

        return {
            user: {
                "id": user.id,
                "email": user.email,
                "fullname": user.full_name,
                "avatar_url": user.avatar_path,
                "create_at": user.created_at
            }
        }
    }

    async login(loginData: LoginDto) {
        const { email, password } = loginData;

        const user = await this.userRepository.findOne({ where: { email } })

        if (!user) {
            throw new UnauthorizedException('email or password is not correct');
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            throw new UnauthorizedException('email or password is not correct')
        }

        const access_token = await this.generateUserTokens(user.id)

        return {
            user: {
                "id": user.id,
                "email": user.email,
                "fullname": user.full_name,
                "avatar_url": user.avatar_path,
                "create_at": user.created_at
            },
            access_token: access_token.accessToken,
            refresh_token: access_token.refreshToken,
        };
    }

    async refreshToken(refreshToken: RefreshTokenDto){

        const { refresh_token } = refreshToken; 

        const tokenInfo = this.Jwtservice.verify(
            refresh_token,
            {
                secret: process.env.JWT_REFRESCH_SECRET,
            }
        );

        if(tokenInfo.type !== 'refresh'){
            throw new UnauthorizedException('token invalid') 
        }

        const id = tokenInfo.userId
        const user = await this.userRepository.findOne({ where : { id }})

        if(!user){
            throw new UnauthorizedException('token invalid')
        }

        
        return await this.generateUserTokens(user.id)
        // {
        //     tokenInfo,
        //     user
        // }
    }

    async generateUserTokens(userId: string) {
        const accessToken = await this.Jwtservice.sign(
            { userId, type: 'access'},
            {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: '15m',
            },
        );

        const refreshToken = await this.Jwtservice.sign(
            { userId, type: 'refresh'},
            {
                secret: process.env.JWT_REFRESCH_SECRET,
                expiresIn: '15d',
            },
        )

        return {
            accessToken,
            refreshToken
        };
    }
}
