import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext){
        const request = context.switchToHttp().getRequest();
        const authorization = request.headers.authorization; // Bearer <Token>
        const token = authorization?.split(' ')[1];
        
        if(!token){
            throw new UnauthorizedException();
        }

        try{
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_ACCESS_SECRET,
            });

            if (payload.type !== 'access'){
                throw new UnauthorizedException();
            }

            request.user = {
                userId: payload.userId,
            };
            
            return true;
        } catch {
            throw new UnauthorizedException();
        }
    }
}