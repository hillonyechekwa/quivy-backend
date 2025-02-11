import { NestFactory, /*HttpAdapterHost, Reflector*/ } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe, /*ClassSerializerInterceptor*/} from "@nestjs/common"
import {SwaggerModule, DocumentBuilder} from "@nestjs/swagger"



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));

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
  await app.listen(8000, () => {console.log(`listening on port 8000`)});
}
bootstrap();
