import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogRequestDto } from '../../dtos/blog/blog.request.dto';
import { Blog, Tag, User } from '../../entities/index';
import { Repository } from 'typeorm';

import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import path from 'path';

@Injectable()
export class BlogService {
  static createFileName(file: Express.Multer.File) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
    @InjectRepository(Tag)
    private readonly TagRepository: Repository<Tag>,
  ) {}

  async findBlogById(id: string): Promise<any> {
    const blog = await this.blogRepository.findOne({ where: { id: id } });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return blog;
  }
  async getAllBlogs(options: IPaginationOptions): Promise<Pagination<Blog>> {
    const queryBuilder = this.blogRepository.createQueryBuilder('Blog');
    queryBuilder.orderBy('Blog.order', 'DESC');

    return paginate<Blog>(queryBuilder, options);
  }

  async createBlog(
    blogRequestDto: BlogRequestDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<any> {
    const author = await this.UserRepository.findOne({
      where: { id: userId },
    });
    if (!author) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const slug = await this.blogRepository.findOne({
      where: { slug: blogRequestDto.slug },
    });
    if (slug) {
      throw new HttpException('Slug already exists', HttpStatus.BAD_REQUEST);
    }
    if (!file) {
      throw new HttpException('File is required!', HttpStatus.BAD_REQUEST);
    }
    const coverImg = await this.createFileUrl(file.filename);
    const newBlog = new Blog();
    newBlog.author = author;
    newBlog.slug = blogRequestDto.slug;
    newBlog.content = blogRequestDto.content;
    newBlog.summary = blogRequestDto.summary;
    // newBlog.published = blogRequestDto.published;
    newBlog.published = true;
    // newBlog.order = blogRequestDto.order;
    newBlog.order = 1;
    newBlog.coverImg = coverImg;
    newBlog.createdTime = new Date().toDateString();

    await this.blogRepository.save(newBlog);
    // const savedBlog = await this.blogRepository.save(newBlog);

    // for (const tagDto of blogRequestDto.tag) {
    //   const tag = new Tag();
    //   tag.tagName = tagDto.tagName;

    //   tag.blogs = [savedBlog];
    //   await this.TagRepository.save(tag);
    // }
    return { message: 'Blog created successfully' };
  }
  async updateBlog(userId: string, id: string, blogRequestDto: any, file) {
    const author = await this.UserRepository.findOne({
      where: { id: userId },
    });

    if (!author) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const slug = await this.blogRepository.findOne({
      where: { slug: blogRequestDto.slug },
    });
    if (slug) {
      throw new HttpException('Slug already exists', HttpStatus.BAD_REQUEST);
    }
    if (!file) {
      throw new HttpException('File is required!', HttpStatus.BAD_REQUEST);
    }
    if (file.originalname.length > 100 || file.originalname.length < 10) {
      throw new HttpException(
        'File name must be contain longer than 10 character or shorter than 100 character',
        HttpStatus.BAD_REQUEST,
      );
    }
    const blog = await this.blogRepository.findOne({ where: { id: id } });
    for (const tagDto of blogRequestDto.Tag) {
      const tag = new Tag();
      tag.tagName = tagDto.tagName;

      // tag.Blog = [blog];
      await this.TagRepository.save(tag);
    }
    await this.blogRepository.update(id, blogRequestDto);
    return { message: 'blog updated successfully' };
  }
  async deleteBlog(userId: string, id: string) {
    const author = await this.UserRepository.findOne({
      where: { id: userId },
    });
    if (!author) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    //   await this.fileHelper.deleteFile(author.profileImg);
    await this.blogRepository.delete({ id });

    return { message: 'Blog deleted successfully' };
  }

  async deleteBlogs() {
    await this.blogRepository.delete({});

    return { message: 'Blogs deleted successfully' };
  }


  // async createFileName(file: Express.Multer.File): Promise<string> {
  //   // Generating a 32 random chars long string
  //   const randomName = (num: number) =>
  //     Array(num)
  //       .fill(null)
  //       .map(() => Math.round(Math.random() * 16).toString(16))
  //       .join('');
  //   //if original name greater than 16 we are cutting characters
  //   //if original name is less than 16 we are adding new characters to the original name
  //   const formatFileName = (originalname: string) => {
  //     if (originalname.length >= 16) {
  //       return originalname.slice(0, 16);
  //     } else {
  //       const padding = randomName(16 - originalname.length);
  //       return originalname + padding;
  //     }
  //   };
  //   const extension: string = path.parse(file.originalname).ext;
  //   //Calling the callback passing the random name generated with the original extension name
  //   return `${randomName(32)}${formatFileName(file.originalname)}${extension}`;
  // }

  private async createFileUrl(
    fileName: string,
  ): Promise<string> {
    // const baseUrl = 'http://localhost:8000';
    const baseUrl = 'https://menuu.online';
    const imageUrl = `${baseUrl}/uploads/${fileName}`;
    return imageUrl;
  }
}
