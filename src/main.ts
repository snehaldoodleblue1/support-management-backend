import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('Support Management API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  // Attempt to bind to configured port or fall back to the next available port(s)
  // prefer PORT env if set, otherwise start at 3001 to avoid colliding with other local services
  const configuredPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  const maxAttempts = 5;
  let port = configuredPort;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await app.listen(port);
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${port}`);
      break;
    } catch (err: any) {
      if (err && err.code === 'EADDRINUSE') {
        // try next port
        // eslint-disable-next-line no-console
        console.warn(`Port ${port} in use, trying port ${port + 1}`);
        port += 1;
        if (attempt === maxAttempts - 1) {
          // eslint-disable-next-line no-console
          console.error(`Unable to bind to a port after ${maxAttempts} attempts`);
          throw err;
        }
        // small delay before retrying
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 200));
        continue;
      }

      throw err;
    }
  }
}

bootstrap();