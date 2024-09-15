import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
} from 'class-validator';
import { Tag } from '../../entities/tag.entity';

export class BlogRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(100)
  slug: string;

  // @IsNumber()
  // @IsNotEmpty()
  // order: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(250)
  @MaxLength(5000)
  content: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(80)
  @MaxLength(250)
  summary: string;

  // @IsNotEmpty()
  // published: boolean;

  // @IsArray()
  // @ArrayMinSize(1)
  // @ArrayMaxSize(10)
  // tag: Tag[];
}
