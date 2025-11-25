import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WeatherService } from './weather.service';
import { ConflictException } from '@nestjs/common';

describe('WeatherService', () => {
    let service: WeatherService;

    const mockModel: any = jest.fn().mockImplementation((dto) => ({
        save: jest.fn().mockResolvedValue({ _id: 'created', ...dto }),
    }));

    mockModel.find = jest.fn();
    mockModel.findById = jest.fn();
    mockModel.findOne = jest.fn();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WeatherService,
                { provide: getModelToken('WeatherLog'), useValue: mockModel },
            ],
        }).compile();

        service = module.get<WeatherService>(WeatherService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('creates a weather log and returns the document', async () => {
            const dto = {
                id: 'ext-123',
                fetched_at: '2025-11-25T10:00:00Z',
                latitude: -9.747,
                longitude: -36.667,
                temperature: 28.5,
                humidity: 65.2,
                precipitation_probability: 15.0,
            } as any;

            const res = await service.create(dto);
            expect(res).toMatchObject({
                _id: 'created',
                externalId: 'ext-123',
                latitude: -9.747,
                longitude: -36.667,
                temperature: 28.5,
                humidity: 65.2,
                precipitationProbability: 15.0,
            });
        });

        it('throws ConflictException when duplicate externalId (error code 11000)', async () => {
            const dto = {
                id: 'duplicate-id',
                fetched_at: '2025-11-25T10:00:00Z',
                latitude: -9.747,
                longitude: -36.667,
                temperature: 28.5,
                humidity: 65.2,
                precipitation_probability: 15.0,
            } as any;

            const duplicateError = new Error('Duplicate key') as any;
            duplicateError.code = 11000;

            mockModel.mockImplementationOnce((dto) => ({
                save: jest.fn().mockRejectedValue(duplicateError),
            }));

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
        });

        it('rethrows other errors', async () => {
            const dto = {
                id: 'test-id',
                fetched_at: '2025-11-25T10:00:00Z',
                latitude: -9.747,
                longitude: -36.667,
                temperature: 28.5,
                humidity: 65.2,
                precipitation_probability: 15.0,
            } as any;

            const otherError = new Error('Database connection failed');

            mockModel.mockImplementationOnce((dto) => ({
                save: jest.fn().mockRejectedValue(otherError),
            }));

            await expect(service.create(dto)).rejects.toThrow('Database connection failed');
        });
    });

    describe('findAll', () => {
        it('returns all weather logs', async () => {
            const logs = [
                { _id: 'log1', externalId: 'ext-1', temperature: 25.0 },
                { _id: 'log2', externalId: 'ext-2', temperature: 30.0 },
            ];
            mockModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(logs) });

            const res = await service.findAll();
            expect(res).toEqual(logs);
            expect(mockModel.find).toHaveBeenCalled();
        });

        it('returns empty array when no logs found', async () => {
            mockModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

            const res = await service.findAll();
            expect(res).toEqual([]);
        });
    });

    describe('findById', () => {
        it('returns a weather log when found', async () => {
            const log = { _id: 'log1', externalId: 'ext-1', temperature: 25.0 };
            mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(log) });

            const res = await service.findById('log1');
            expect(res).toEqual(log);
            expect(mockModel.findById).toHaveBeenCalledWith('log1');
        });

        it('returns null when not found', async () => {
            mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

            const res = await service.findById('nonexistent');
            expect(res).toBeNull();
        });
    });

    describe('findByExternalId', () => {
        it('returns a weather log when found by externalId', async () => {
            const log = { _id: 'log1', externalId: 'ext-123', temperature: 27.5 };
            mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(log) });

            const res = await service.findByExternalId('ext-123');
            expect(res).toEqual(log);
            expect(mockModel.findOne).toHaveBeenCalledWith({ externalId: 'ext-123' });
        });

        it('returns null when not found by externalId', async () => {
            mockModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

            const res = await service.findByExternalId('nonexistent-ext');
            expect(res).toBeNull();
        });
    });
});