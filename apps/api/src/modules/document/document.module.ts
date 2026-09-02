import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../../entities/document.entity.js';
import { ChunkModule } from '../chunk/chunk.module.js';
import { DocumentController } from './document.controller.js';
import { DocumentService } from './document.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), ChunkModule],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
