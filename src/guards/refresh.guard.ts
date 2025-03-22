import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshJwtGuard extends AuthGuard('refresh-jwt') {
     canActivate(context: ExecutionContext) {
        return super.canActivate(context);
      }
    
      handleRequest(err, user, info, context, status) {
        return super.handleRequest(err, user, info, context, status);
      }
}
