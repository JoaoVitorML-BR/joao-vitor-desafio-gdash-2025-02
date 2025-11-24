import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    registerEnterprise: jest.fn(),
    registerUserByAdmin: jest.fn(),
    login: jest.fn(),
  };

  const mockUsersService = {
    countUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register should delegate to authService.register', async () => {
    mockAuthService.register.mockResolvedValue({ ok: true });
    const dto = { email: 'a@b.com', password: 'p' } as any;
    const res = await controller.register(dto);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ ok: true });
  });

  it('login should delegate to authService.login', async () => {
    mockAuthService.login.mockResolvedValue({ access_token: 't' });
    const dto = { email: 'a@b.com', password: 'p' } as any;
    const res = await controller.login(dto);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ access_token: 't' });
  });

  it('checkFirstUser should return isFirstUser based on usersService.countUsers', async () => {
    mockUsersService.countUsers.mockResolvedValue(0);
    const res = await controller.checkFirstUser();
    expect(mockUsersService.countUsers).toHaveBeenCalled();
    expect(res).toEqual({ isFirstUser: true });
  });
});
