import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * 配置 Swagger 文档
 * @param app Nest 应用实例
 */
export const setupSwagger = (app: INestApplication): void => {
  {
    const config = new DocumentBuilder()
      .setTitle('RAG 知识库平台')
      .setDescription('RAG 知识库平台 API 文档描述')
      .setVersion('1.0')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    // Swagger 文档路径 /api-docs，访问 http://localhost:3000/api-docs 查看 Swagger 文档
    SwaggerModule.setup('api-docs', app, documentFactory, {
      swaggerOptions: {
        filter: true, // 启用搜索框（只能根据tag进行搜索）

        defaultModelExpandDepth: 3, // 控制每个接口里的 Schema 的展开深度
        defaultModelsExpandDepth: 3, // 控制底部 Schemas 的展开深度
        // docExpansion: 'none', // 默认折叠所有接口
        // displayRequestDuration: true, // 显示请求耗时

        // tagsSorter: 'alpha', // 按字母排序标签
        // operationsSorter: 'alpha', // 按字母排序操作

        // persistAuthorization: true, // 保存认证信息（刷新页面保留 token）
      },
      customSiteTitle: 'RAG 知识库平台 API',
    });
  }
};
