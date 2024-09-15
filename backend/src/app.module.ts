// modules
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// custom modules
import { TagModule } from 'src/modules/tag/tag.module';
import { BlogModule } from 'src/modules/blog/blog.module';
import { UserModule } from 'src/modules/user/user.module';
//config files
import databaseConfig from './config/typeorm.config';
//
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', 
    }),
    UserModule,
    BlogModule,
    TagModule,
  ],
})
export class AppModule {}
