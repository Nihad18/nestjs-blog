import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagController } from 'src/controllers/tag/tag.controller';
import { TagService } from 'src/services/tag/tag.service';
import { Tag, User } from 'src/entities';
// import { AccessTokenValidationMiddleware } from 'src/middlewares/accesstokenvalidation.middleware';
import { UuidValidationMiddleware } from 'src/middlewares/uuidvalidation.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, User])],
  providers: [TagService],
  controllers: [TagController],
})
export class TagModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UuidValidationMiddleware)
      .forRoutes(
        { path: 'api/tags/:id', method: RequestMethod.GET },
        { path: 'api/tags/:id', method: RequestMethod.DELETE },
        { path: 'api/tags/:id', method: RequestMethod.PATCH },
      );
  }
}
