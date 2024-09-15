import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
//entities
import { Blog, Role, User } from 'src/entities';
// middlewares
// import { AccessTokenValidationMiddleware } from 'src/middlewares/accesstokenvalidation.middleware';
import { UuidValidationMiddleware } from 'src/middlewares/uuidvalidation.middleware';
//modules
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '@nestjs-modules/mailer';
//controllers
import { UserController } from 'src/controllers/user/user.controller';
//services
import { UserService } from 'src/services/user/user.service';
import { JwtAuthStrategy } from 'src/guards/jwt-auth-strategy';
//config
import mailConfig from 'src/config/mail.config';
// guards
import { RolesGuard } from 'src/guards/role-guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Blog]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1w' },
    }),
    MailerModule.forRootAsync({
      useFactory: mailConfig,
    }),
  ],
  providers: [UserService, JwtAuthStrategy, JwtAuthGuard, RolesGuard],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(UuidValidationMiddleware)
  //     .exclude(
  //       {
  //         path: 'api/users/',
  //         method: RequestMethod.GET,
  //       },
  //       {
  //         path: 'api/users/register-admin',
  //         method: RequestMethod.POST,
  //       },
  //       {
  //         path: 'api/users/login',
  //         method: RequestMethod.POST,
  //       },
  //     )
  //     .forRoutes(
  //       { path: 'api/users/:id', method: RequestMethod.ALL },
  //       { path: 'api/users/change-password/:id', method: RequestMethod.PATCH },
  //     );
  // }
}
