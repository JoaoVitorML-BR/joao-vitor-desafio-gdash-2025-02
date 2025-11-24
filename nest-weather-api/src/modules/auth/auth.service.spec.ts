import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));
const mockedBcrypt = jest.requireMock('bcryptjs') as { compare: jest.Mock; hash: jest.Mock };
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
    let service: AuthService;

    const mockUsersService = {
        findByEmail: jest.fn(),
        create: jest.fn(),
        countUsers: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('signed-token'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('returns user data when credentials match', async () => {
            const user: any = {
                _id: 'u1',
                email: 'a@b.com',
                password: 'hash',
                name: 'User',
                role: 'user',
                toObject: function () { return { _id: this._id, email: this.email, password: this.password, name: this.name, role: this.role }; }
            };
            mockUsersService.findByEmail.mockResolvedValue(user);
            mockedBcrypt.compare.mockResolvedValue(true);

            const res = await service.validateUser('a@b.com', 'secret');
            expect(mockUsersService.findByEmail).toHaveBeenCalledWith('a@b.com');
            expect(res).toMatchObject({ _id: 'u1', email: 'a@b.com', name: 'User', role: 'user' });
            expect((res as any).password).toBeUndefined();
        });

        it('returns null when user not found or password mismatch', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);
            const res = await service.validateUser('no@one.com', 'x');
            expect(res).toBeNull();
        });
    });

    describe('login', () => {
        it('throws UnauthorizedException when validateUser returns null', async () => {
            jest.spyOn(service, 'validateUser' as any).mockResolvedValue(null);
            await expect(service.login({ email: 'a@b.com', password: 'x' } as any)).rejects.toThrow(UnauthorizedException);
        });

        it('returns token and user when valid', async () => {
            const user = { _id: 'u1', email: 'a@b.com', name: 'User', role: 'user' } as any;
            jest.spyOn(service, 'validateUser' as any).mockResolvedValue(user);

            const res = await service.login({ email: 'a@b.com', password: 'x' } as any);
            expect(mockJwtService.sign).toHaveBeenCalled();
            expect(res).toHaveProperty('access_token');
            expect(res.user).toMatchObject({ id: 'u1', email: 'a@b.com', name: 'User', role: 'user' });
        });
    });

    describe('register', () => {
        it('throws ConflictException when email exists', async () => {
            mockUsersService.countUsers.mockResolvedValue(1);
            mockUsersService.findByEmail.mockResolvedValue({});
            await expect(service.register({ email: 'a@b.com', password: 'p' } as any)).rejects.toThrow(ConflictException);
        });

        it('creates and returns token and user when new', async () => {
            mockUsersService.countUsers.mockResolvedValue(0);
            mockUsersService.findByEmail.mockResolvedValue(null);
            mockedBcrypt.hash.mockResolvedValue('hashed');
            const createdUser = { _id: 'u2', email: 'new@u.com', password: 'hashed', toObject: function () { return { _id: this._id, email: this.email, password: this.password }; } };
            mockUsersService.create.mockResolvedValue(createdUser);

            const res = await service.register({ email: 'new@u.com', password: 'p' } as any);
            expect(mockJwtService.sign).toHaveBeenCalled();
            expect(res).toHaveProperty('access_token');
            expect(res.user).toMatchObject({ _id: 'u2', email: 'new@u.com' });
        });
    });

    describe('registerUserByAdmin and registerEnterprise', () => {
        it('throws ConflictException when email exists for admin create', async () => {
            mockUsersService.findByEmail.mockResolvedValue({});
            await expect(service.registerUserByAdmin({ email: 'e@e.com', password: 'p' } as any)).rejects.toThrow(ConflictException);
        });

        it('creates user by admin and returns message', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);
            mockedBcrypt.hash.mockResolvedValue('h');
            const u = { _id: 'u3', email: 'a@b.com', password: 'h', toObject: function () { return { _id: this._id, email: this.email, password: this.password }; } };
            mockUsersService.create.mockResolvedValue(u);

            const res = await service.registerUserByAdmin({ email: 'a@b.com', password: 'p', role: 'user' } as any);
            expect(res).toHaveProperty('message');
            expect(res.user).toMatchObject({ _id: 'u3', email: 'a@b.com' });
        });
    });
});
