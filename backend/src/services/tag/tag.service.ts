import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../../entities/index';
import { Repository } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async findTagById(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });

    if (!tag) {
      throw new NotFoundException(`tag with ID ${id} not found`);
    }

    return tag;
  }

  async getAllTags(options: IPaginationOptions): Promise<Pagination<Tag>> {
    const queryBuilder = this.tagRepository.createQueryBuilder('tag');
    // queryBuilder.orderBy('tag.order', 'DESC');

    return paginate<Tag>(queryBuilder, options);
  }

  async createTag(tagName: string): Promise<Tag> {
    const newTag = this.tagRepository.create({ tagName });
    return await this.tagRepository.save(newTag);
  }

  async updateTag(id: string, tagName: string): Promise<Tag> {
    const tag = await this.findTagById(id);

    tag.tagName = tagName;
    return await this.tagRepository.save(tag);
  }

  async deleteTag(id: string): Promise<void> {
    const tag = await this.findTagById(id);
    await this.tagRepository.remove(tag);
  }
}
