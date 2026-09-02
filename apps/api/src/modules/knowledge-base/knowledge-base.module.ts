import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../../entities/document.entity.js';
import { KnowledgeBase } from '../../entities/knowledge-base.entity.js';
import { KnowledgeBaseController } from './knowledge-base.controller.js';
import { KnowledgeBaseService } from './knowledge-base.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeBase, Document])],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
