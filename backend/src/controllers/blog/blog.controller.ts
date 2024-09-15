import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Req,
  HttpException,
  Delete,
  Patch,
  DefaultValuePipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
// dtos
import { BlogRequestDto } from 'src/dtos/blog/blog.request.dto';
// decators
import { RoleDecerator } from 'src/decorators/role.decerator';
// enums
import { RoleEnum } from 'src/enums/role.enum';
// guards
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { RolesGuard } from 'src/guards/role-guard';
// services
import { BlogService } from 'src/services/blog/blog.service';

import { Pagination } from 'nestjs-typeorm-paginate';
import { Blog } from 'src/entities/index';

import { storage } from 'src/helper/fileHelper';

@Controller('api/blogs')
export class BlogController {
  constructor(private readonly blogsService: BlogService) {}

  @Get(':id')
  async findBlogById(@Param('id') id: string): Promise<any> {
    try {
      const user = await this.blogsService.findBlogById(id);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }

  @Get()
  async getAllBlogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Req() req: Request,
  ): Promise<Pagination<Blog>> {
    limit = limit > 100 ? 100 : limit;
    const rootUrl = `${req.protocol}://${req.get('Host')}${req.originalUrl}`;
    return await this.blogsService.getAllBlogs({
      page,
      limit,
      route: rootUrl,
    });
  }

  @Post('/create')
  @RoleDecerator([RoleEnum.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(ValidationPipe)
  @UseInterceptors(FileInterceptor('coverImg', { storage: storage }))
  async createBlog(
    @Body() blogRequestDto: BlogRequestDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<void | object> {
    try {
      const userId = await req.user.id;
      return this.blogsService.createBlog(blogRequestDto, file, userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException({ error: error.message }, error.getStatus());
      }
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }

  @Patch('/:id')
  @RoleDecerator([RoleEnum.Admin])
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('coverImg'))
  async updateBlog(
    @Param('id') blogId: string,
    @Req() req,
    @Body() blogRequestDto: BlogRequestDto,
    @UploadedFile() file,
  ): Promise<void | object> {
    try {
      const userId = await req.user.id;
      return this.blogsService.updateBlog(userId, blogId, blogRequestDto, file);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException({ error: error.message }, error.getStatus());
      }
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }

  @Delete('/:id')
  @RoleDecerator([RoleEnum.Admin])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteBlog(
    @Param('id') blogId: string,
    @Req() req,
  ): Promise<void | object> {
    try {
      const userId = await req.user.id;
      return this.blogsService.deleteBlog(userId, blogId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException({ error: error.message }, error.getStatus());
      }
      throw new InternalServerErrorException(
        'An internal server error occurred.',
      );
    }
  }
  @Delete('')
  async deleteBlogs(
  ): Promise<void | object> {
      return this.blogsService.deleteBlogs();
  }
}
