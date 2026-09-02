import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCall } from '../../entities/service-call.entity.js';
import { ChatModule } from '../chat/chat.module.js';
import { ServiceCallController } from './service-call.controller.js';
import { ServiceCallService } from './service-call.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceCall]), ChatModule],
  controllers: [ServiceCallController],
  providers: [ServiceCallService],
})
export class ServiceCallModule {}
