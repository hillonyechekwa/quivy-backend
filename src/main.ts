import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import {ClassSerializerInterceptor, ValidationPipe, /*ClassSerializerInterceptor*/} from "@nestjs/common"
import {SwaggerModule, DocumentBuilder} from "@nestjs/swagger"



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
      .setTitle('quivy')
      .setDescription("")
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          name: "JWT",
          description: "Enter JWT Token",
          in: "header"
        },
        "JWT-auth"
      )
      .build();

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  const {httpAdapter} = app.get(HttpAdapterHost)
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
  await app.listen(8000, () => {console.log(`listening on port 8000`)});
}
bootstrap();
