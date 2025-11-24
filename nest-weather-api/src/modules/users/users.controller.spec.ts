import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ForbiddenException } from '@nestjs/common';

describe('UsersController', () => {
    let controller: UsersController;

    const mockUsersService = {
        findAll: jest.fn(),
        findById: jest.fn(),
        findByName: jest.fn(),
        validateUser: jest.fn(),
        remove: jest.fn(),
        update: jest.fn(),
        findByRole: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [{ provide: UsersService, useValue: mockUsersService }],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('findAll should map users', async () => {
        mockUsersService.findAll.mockResolvedValue([{ _id: '1', name: 'A', email: 'a@b', role: 'user', createdAt: new Date(), updatedAt: new Date() }]);
        const res = await controller.findAll();
        expect(res[0]).toHaveProperty('id', '1');
    });

    it('findOne should throw Forbidden when not owner or admin', async () => {
        const req = { user: { userId: 'other', role: 'user' } } as any;
        await expect(controller.findOne('u1', req)).rejects.toThrow(ForbiddenException);
    });

    it('findOne should return mapped user when allowed', async () => {
        const req = { user: { userId: 'u1', role: 'user' } } as any;
        mockUsersService.findById.mockResolvedValue({ _id: 'u1', name: 'A', email: 'a@b', role: 'user', createdAt: new Date(), updatedAt: new Date() });
        const res = await controller.findOne('u1', req);
        expect(res).toHaveProperty('id', 'u1');
    });

    it('findByName requires admin', async () => {
        const req = { user: { role: 'user' } } as any;
        await expect(controller.findByName('x', req)).rejects.toThrow(ForbiddenException);
    });

    it('findByName returns message when not found', async () => {
        const req = { user: { role: 'admin' } } as any;
        mockUsersService.findByName.mockResolvedValue(null);
        const res = await controller.findByName('n', req);
        expect(res).toEqual({ message: 'Usuário não encontrado' });
    });

    it('validateUser returns status', async () => {
        mockUsersService.validateUser.mockResolvedValue(true);
        const res = await controller.validateUser('u1');
        expect(res).toMatchObject({ userId: 'u1', isValid: true });
    });

    it('deleteUser throws when not allowed', async () => {
        const req = { user: { userId: 'x', role: 'user' } } as any;
        await expect(controller.deleteUser('u1', req)).rejects.toThrow(ForbiddenException);
    });

    it('deleteUser delegates to service when allowed', async () => {
        const req = { user: { userId: 'u1', role: 'user' } } as any;
        mockUsersService.remove.mockResolvedValue(undefined);
        const res = await controller.deleteUser('u1', req);
        expect(res).toEqual({ message: 'Usuário excluído com sucesso' });
    });

    it('updateUser throws when not allowed', async () => {
        const req = { user: { userId: 'x', role: 'user' } } as any;
        await expect(controller.updateUser('u1', { name: 'n' } as any, req)).rejects.toThrow(ForbiddenException);
    });

    it('updateUser updates when allowed', async () => {
        const req = { user: { userId: 'u1', role: 'user' } } as any;
        mockUsersService.update.mockResolvedValue({ _id: 'u1', name: 'n', email: 'a@b', role: 'user', createdAt: new Date(), updatedAt: new Date() });
        const res = await controller.updateUser('u1', { name: 'n' } as any, req);
        expect(res).toHaveProperty('id', 'u1');
    });

    it('role routes delegate to findByRole', async () => {
        mockUsersService.findByRole.mockResolvedValue([]);
        await expect(controller.getAdmins()).resolves.toEqual([]);
        await expect(controller.getClients()).resolves.toEqual([]);
        await expect(controller.getEnterprises()).resolves.toEqual([]);
    });
});
