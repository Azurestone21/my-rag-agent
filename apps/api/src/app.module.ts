import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { Chunk } from './entities/chunk.entity.js';
import { Document } from './entities/document.entity.js';
import { KnowledgeBase } from './entities/knowledge-base.entity.js';
import { SearchHistory } from './entities/search-history.entity.js';
import { ServiceCall } from './entities/service-call.entity.js';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module.js';
import { DocumentModule } from './modules/document/document.module.js';
import { ChunkModule } from './modules/chunk/chunk.module.js';
import { SearchModule } from './modules/search/search.module.js';
import { ChatModule } from './modules/chat/chat.module.js';
import { ServiceCallModule } from './modules/service-call/service-call.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [KnowledgeBase, Document, Chunk, ServiceCall, SearchHistory],
        synchronize: true,
      }),
    }),
    KnowledgeBaseModule,
    DocumentModule,
    ChunkModule,
    SearchModule,
    ChatModule,
    ServiceCallModule,
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    // ObserveModule.forRoot({
    //   appKey: 'YOUR_APP_KEY',
    //   appSecret: 'YOUR_APP_SECRET',
    //   serviceId: 'api',
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
