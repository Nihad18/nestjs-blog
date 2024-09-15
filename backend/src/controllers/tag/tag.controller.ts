import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
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
  
  // decorators
  import { RoleDecerator } from '../../decorators/role.decerator';
  // enums
  import { RoleEnum } from '../../enums/role.enum';
  // guards
  import { JwtAuthGuard } from '../../guards/jwt-auth-guard';
  import { RolesGuard } from '../../guards/role-guard';
  
  import { TagService } from '../../services/tag/tag.service';
  
  import { Pagination } from 'nestjs-typeorm-paginate';
  import { Tag } from 'src/entities';
  
  @Controller('api/tags')
  export class TagController {
    constructor(private readonly tagService: TagService) {}
  
    @Get()
    async getAllTags(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
      @Req() req: Request,
    ): Promise<Pagination<Tag>> {
      limit = limit > 100 ? 100 : limit;
      const rootUrl = `${req.protocol}://${req.get('Host')}${req.originalUrl}`;
      // const { protocol, headers } = req;
      // const baseUrl = `${protocol}://${headers.host}`;
      // const queryParams = new URLSearchParams(req.query as any).toString();
      // const rootUrl = queryParams ? `${baseUrl}/api/tags?${queryParams}` : `${baseUrl}/api/tags`;
      return await this.tagService.getAllTags({
        page,
        limit,
        route: rootUrl,
      });
    }
  
    @Get(':id')
    async getTagById(@Param('id') id: string): Promise<Tag> {
      return await this.tagService.findTagById(id);
    }
  
    @RoleDecerator([RoleEnum.Editor, RoleEnum.Admin])
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    // @UsePipes(ValidationPipe)
    async createTag(@Body('tagName') tagName: string): Promise<Tag> {
      if (!tagName) {
        throw new BadRequestException('Tag name is required');
      }
      return await this.tagService.createTag(tagName);
    }
  
    @RoleDecerator([RoleEnum.Editor, RoleEnum.Admin])
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(':id')
    @UsePipes(ValidationPipe)
    async updateTag(
      @Param('id') id: string,
      @Body('tagName') tagName: string,
    ): Promise<Tag> {
      if (!tagName) {
        throw new BadRequestException('Tag name is required');
      }
      return await this.tagService.updateTag(id, tagName);
    }
  
    @RoleDecerator([RoleEnum.Editor, RoleEnum.Admin])
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':id')
    async deleteTag(@Param('id') id: string): Promise<void> {
      return await this.tagService.deleteTag(id);
    }
  }
  