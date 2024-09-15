/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// typeorm
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

// entities
import { Blog, Role, User } from 'src/entities';
// jwt packages
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken';
import { MailerService } from '@nestjs-modules/mailer';
import { RoleEnum } from 'src/enums/role.enum';
import {
  UserReqDto,
  LoginReqDto,
  ForgotPasswordReqDto,
  ResetPasswordReqDto,
  ChangePasswordReqDto,
} from 'src/dtos/user/user.request.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    private readonly configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  //   async logOut(userId: string): Promise<object> {
  //     const user = await this.userRepository.findOne({ where: { id: userId } });
  //     // If no user is found, throw a NotFoundException
  //     if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //     user.accessToken = null;
  //     await this.userRepository.save(user);
  //     return { message: 'User logout successfully' };
  //   }

  async requestPasswordReset(
    resetPasswordReqDto: ResetPasswordReqDto,
  ): Promise<void> {
    const { email } = resetPasswordReqDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = crypto.randomUUID().toString();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);

    await this.userRepository.save(user);

    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click this link to reset your password: ${resetLink}`,
    });
  }

  async forgotPassword(
    forgotPasswordReqDto: ForgotPasswordReqDto,
  ): Promise<void> {
    const { token, newPassword } = forgotPasswordReqDto;
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired token');
    }

    user.password = await this.hashPasword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);
  }

  async authenticate(authRequestDto: LoginReqDto): Promise<any> {
    const foundedUser = await this.userRepository.find({
      where: { email: authRequestDto.email },
      relations: { roles: true },
    });

    const user = foundedUser[0];

    if (!user) throw new NotFoundException('User not found');

    const isValid = await this.comparePassword(
      authRequestDto.password,
      user.password,
    );

    if (!isValid)
      throw new HttpException(
        'Email or password is invalid',
        HttpStatus.BAD_REQUEST,
      );

    const jwtSecret = this.configService.get('JWT_SECRET');
    const accessToken = sign({ ...user }, jwtSecret, { expiresIn: '7d' });

    await this.userRepository.save(user);
    return { accessToken };
  }

  async createUser(user: UserReqDto): Promise<void | object> {
    const userIsExist = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (userIsExist) {
      throw new HttpException('Email is used before!', HttpStatus.BAD_REQUEST);
    }

    const newUser = new User();
    newUser.fullName = user.fullName;
    newUser.email = user.email;
    newUser.password = await this.hashPasword(user.password);

    try {
      const savedUser = await this.userRepository.save(newUser);
      const newRole = new Role();
      newRole.user = savedUser;
      newRole.roleName = RoleEnum.Editor;

      await this.roleRepository.save(newRole);
      return { message: 'User created successfully' };
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async createAdmin(user: UserReqDto): Promise<void | object> {
    const userIsExist = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (userIsExist) {
      throw new HttpException('Email is used before!', HttpStatus.BAD_REQUEST);
    }

    const newUser = new User();
    newUser.fullName = user.fullName;
    newUser.email = user.email;
    newUser.password = await this.hashPasword(user.password);

    try {
      const savedUser = await this.userRepository.save(newUser);
      const newRole = new Role();
      newRole.user = savedUser;
      newRole.roleName = RoleEnum.Admin;

      await this.roleRepository.save(newRole);
      return { message: 'User created successfully' };
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllUsers(options: IPaginationOptions): Promise<Pagination<User>> {
    const queryBuilder = this.userRepository.createQueryBuilder('users');

    queryBuilder.select([
      'users.id',
      'users.fullName',
      'users.email',
    ]);

    queryBuilder.leftJoinAndSelect('users.roles', 'roles');
    queryBuilder.addSelect(['roles.roleName']);
    queryBuilder.orderBy('users.fullName', 'DESC');

    return paginate<User>(queryBuilder, options);
  }

  async findUserById(id: string): Promise<any> {
    const user = await this.userRepository.find({
      relations: ['roles'],
      select: {
        id: true,
        fullName: true,
        email: true,
        roles: {
          roleName: true,
        },
      },
      where: {
        id: id,
      },
    });

    if (!user[0]) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user[0];
  }

  async updateUserInfo(
    id: string,
    updateUserDto: Partial<UserReqDto>,
  ): Promise<any> {
    try {
      await this.findUserById(id);

      await this.userRepository.update(id, updateUserDto);

      return { message: 'User updated successfully' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordReqDto,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!user) throw new NotFoundException('');
    const oldPassword = changePasswordDto.oldPassword.trim();
    const newPassword = changePasswordDto.newPassword.trim();
    const result = await bcrypt.compare(oldPassword, user.password);
    if (result) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.userRepository.update(id, { password: hashedPassword });
      return { message: 'Password updated successfully' };
    } else {
      throw new BadRequestException('');
    }
  }

  async deleteUser(id: string): Promise<any> {
    const user = await this.findUserById(id);
    const roles = user.roles.map((role) => role.roleName);

    if (roles.includes('admin')) {
      throw new HttpException(
        'Admin cannot delete own account.',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      await this.roleRepository.delete({ user: { id } });

      await this.blogRepository.delete({ author: { id } });

      await this.userRepository.delete({ id });

      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  hashPasword(password: string): Promise<string> {
    const saltOrRounds = 10;
    return bcrypt.hash(password, saltOrRounds);
  }

  comparePassword(
    userReqPassword: string,
    userPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(userReqPassword, userPassword);
  }

  getUserByEmail(email: string): Promise<any> {
    return this.userRepository.findOne({ where: { email: email } });
  }
}
