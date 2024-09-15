import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

// decators
import { RoleDecerator } from '../../decorators/role.decerator';
// enums
import { RoleEnum } from '../../enums/role.enum';
// guards
import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
import { RolesGuard } from '../../guards/role-guard';

import { UserService } from '../../services/user/user.service';

import { Pagination } from 'nestjs-typeorm-paginate';
import { User } from 'src/entities';
import {
  UserReqDto,
  ForgotPasswordReqDto,
  ResetPasswordReqDto,
  LoginReqDto,
  ChangePasswordReqDto,
} from 'src/dtos/user/user.request.dto';
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('req-password-reset')
  @UsePipes(ValidationPipe)
  async requestPasswordReset(
    @Body() resetPasswordReqDto: ResetPasswordReqDto,
  ): Promise<any> {
    try {
      return await this.userService.requestPasswordReset(resetPasswordReqDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('forgot-password')
  @UsePipes(ValidationPipe)
  async forgotPassword(
    @Body() forgotPasswordReqDto: ForgotPasswordReqDto,
  ): Promise<any> {
    try {
      return await this.userService.forgotPassword(forgotPasswordReqDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException({ error: error.message }, error.getStatus());
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  async authenticate(@Body() loginReqDto: LoginReqDto): Promise<any> {
    try {
      return await this.userService.authenticate(loginReqDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException({ error: error.message }, error.getStatus());
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  @UsePipes(ValidationPipe)
  async createUser(@Body() userReqDto: UserReqDto): Promise<any> {
    try {
      return await this.userService.createUser(userReqDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException({ error: error.message }, error.getStatus());
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @Post('register-admin')
  // @UsePipes(ValidationPipe)
  // async createAdmin(@Body() userReqDto: UserReqDto): Promise<any> {
  //   try {
  //     return await this.userService.createAdmin(userReqDto);
  //   } catch (error) {
  //     if (error instanceof HttpException) {
  //       throw new HttpException({ error: error.message }, error.getStatus());
  //     }
  //     throw new HttpException(
  //       'Internal Server Error',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  @RoleDecerator([RoleEnum.Editor, RoleEnum.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Req() req: Request,
  ): Promise<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;
    const rootUrl = `${req.protocol}://${req.get('Host')}${req.originalUrl}`;
    return await this.userService.getAllUsers({
      page,
      limit,
      route: rootUrl,
    });
  }

  // @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findUserById(@Param('id') id: string): Promise<any> {
    try {
      const user = await this.userService.findUserById(id);
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException({ error: error.message }, error.getStatus());
      }
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UsePipes(ValidationPipe)
  async updateUserInfo(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<UserReqDto>,
  ): Promise<any> {
    return await this.userService.updateUserInfo(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password/:id')
  @UsePipes(ValidationPipe)
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordReqDto,
  ): Promise<any> {
    try {
      return await this.userService.changePassword(id, changePasswordDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException({ error: error.message }, error.getStatus());
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @RoleDecerator([RoleEnum.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<any> {
    try {
      return await this.userService.deleteUser(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException({ error: error.message }, error.getStatus());
      }
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
