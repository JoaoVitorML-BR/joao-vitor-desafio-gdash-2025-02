import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
}));
const mockedBcrypt = jest.requireMock('bcryptjs') as { hash: jest.Mock };

describe('UsersService', () => {
    let service: UsersService;

    const mockModel: any = jest.fn().mockImplementation((dto) => ({
        save: jest.fn().mockResolvedValue({ _id: 'created', ...dto }),
    }));

    mockModel.countDocuments = jest.fn();
    mockModel.findById = jest.fn();
    mockModel.findOne = jest.fn();
    mockModel.find = jest.fn();
    mockModel.findByIdAndUpdate = jest.fn();
    mockModel.findByIdAndDelete = jest.fn();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getModelToken('User'), useValue: mockModel },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('creates a user and returns the document', async () => {
            const dto = { name: 'A', email: 'a@b.com', password: 'p' } as any;
            const res = await service.create(dto);
            expect(res).toMatchObject({ _id: 'created', name: 'A', email: 'a@b.com' });
        });
    });

    describe('countUsers and isFirstUser', () => {
        it('returns count and isFirstUser boolean', async () => {
            mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(2) });
            const c = await service.countUsers();
            expect(c).toBe(2);
            mockModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });
            const isFirst = await service.isFirstUser();
            expect(isFirst).toBe(true);
        });
    });

    describe('findById', () => {
        it('returns a user when found', async () => {
            mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'u1' }) });
            const u = await service.findById('u1');
            expect(u).toEqual({ _id: 'u1' });
        });

        it('throws NotFoundException when not found', async () => {
            mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.findById('x')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByEmail and findByName', () => {
        it('returns user or null', async () => {
            mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'u2' }) });
            const byEmail = await service.findByEmail('a@b.com');
            expect(byEmail).toEqual({ _id: 'u2' });
            mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            const byName = await service.findByName('no');
            expect(byName).toBeNull();
        });
    });

    describe('validateUser', () => {
        it('returns true when user exists', async () => {
            mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'ok' }) });
            const r = await service.validateUser('ok');
            expect(r).toBe(true);
            mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            const r2 = await service.validateUser('no');
            expect(r2).toBe(false);
        });
    });

    describe('findAll and findByRole', () => {
        it('returns lists from find', async () => {
            const users = [{ _id: '1' }];
            mockModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(users) });
            const res = await service.findAll();
            expect(res).toEqual(users);
            mockModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: '2' }]) });
            const r = await service.findByRole('admin');
            expect(r).toEqual([{ _id: '2' }]);
        });
    });

    describe('update', () => {
        it('hashes password when provided and returns updated user', async () => {
            mockedBcrypt.hash.mockResolvedValue('h');
            mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'u3', password: 'h' }) });
            const res = await service.update('u3', { password: 'p' } as any);
            expect(mockedBcrypt.hash).toHaveBeenCalledWith('p', 10);
            expect(res).toEqual({ _id: 'u3', password: 'h' });
        });

        it('throws NotFoundException when update returns null', async () => {
            mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.update('x', {} as any)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('removes user when found', async () => {
            mockModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: 'u4' }) });
            await expect(service.remove('u4')).resolves.toBeUndefined();
        });

        it('throws NotFoundException when delete returns null', async () => {
            mockModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
            await expect(service.remove('x')).rejects.toThrow(NotFoundException);
        });
    });
});
