import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogController } from 'src/controllers/blog/blog.controller';
import { BlogService } from 'src/services/blog/blog.service';
import { Blog, Tag, User } from 'src/entities';
// import { AccessTokenValidationMiddleware } from 'src/middlewares/accesstokenvalidation.middleware';
import { UuidValidationMiddleware } from 'src/middlewares/uuidvalidation.middleware';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, Tag, User]),
    MulterModule.register({ dest: './uploads' }),
  ],
  providers: [BlogService],
  controllers: [BlogController],
  exports: [BlogService],
})
export class BlogModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(UuidValidationMiddleware)
  //     .forRoutes(
  //       { path: 'api/blogs/:id', method: RequestMethod.GET },
  //       { path: 'api/blogs/:id', method: RequestMethod.DELETE },
  //       { path: 'api/blogs/:id', method: RequestMethod.PATCH },
  //     );
  // }
}
