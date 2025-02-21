import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard is running');
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context, status) {
    console.log('JwtAuthGuard handleRequest:', { err, user, info, status });
    return super.handleRequest(err, user, info, context, status);
  }
}

