import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule, ObserveInstrument } from './app.module.js';
import { setupSwagger } from './config/swagger.config.js';
import { HttpExceptionFilter } from './filters/http-exception.filter.js';
import { ResponseInterceptor } from './interceptors/response.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  const config = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api'); // 全局路由前缀
  app.useGlobalFilters(new HttpExceptionFilter()); // 全局异常过滤器
  app.useGlobalInterceptors(new ResponseInterceptor<any>()); // 全局响应拦截器

  setupSwagger(app); // 配置 Swagger 文档

  // 配置 CORS
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN') ?? 'http://localhost:5173',
    credentials: true,
  });
  await app.listen(Number(config.get('API_PORT') ?? process.env.PORT ?? 3000));
}
await bootstrap();
