import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

describe('WeatherController', () => {
    let controller: WeatherController;

    const mockWeatherService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findByExternalId: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WeatherController],
            providers: [{ provide: WeatherService, useValue: mockWeatherService }],
        }).compile();

        controller = module.get<WeatherController>(WeatherController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a weather log', async () => {
            const dto = {
                id: 'ext-123',
                fetched_at: '2025-11-25T10:00:00Z',
                latitude: -9.747,
                longitude: -36.667,
                temperature: 28.5,
                humidity: 65.2,
                precipitation_probability: 15.0,
            } as any;

            const createdLog = {
                _id: 'mongo-id-123',
                externalId: 'ext-123',
                fetchedAt: new Date('2025-11-25T10:00:00Z'),
                latitude: -9.747,
                longitude: -36.667,
                temperature: 28.5,
                humidity: 65.2,
                precipitationProbability: 15.0,
            };

            mockWeatherService.create.mockResolvedValue(createdLog);

            const res = await controller.create(dto);
            expect(mockWeatherService.create).toHaveBeenCalledWith(dto);
            expect(res).toEqual(createdLog);
        });

        it('should handle ConflictException from service', async () => {
            const dto = {
                id: 'duplicate-id',
                fetched_at: '2025-11-25T10:00:00Z',
                latitude: -9.747,
                longitude: -36.667,
                temperature: 28.5,
                humidity: 65.2,
                precipitation_probability: 15.0,
            } as any;

            mockWeatherService.create.mockRejectedValue(new Error('Weather log with this ID already exists'));

            await expect(controller.create(dto)).rejects.toThrow('Weather log with this ID already exists');
        });
    });

    describe('findAll', () => {
        it('should return all weather logs', async () => {
            const logs = [
                {
                    _id: 'log1',
                    externalId: 'ext-1',
                    fetchedAt: new Date(),
                    temperature: 25.0,
                },
                {
                    _id: 'log2',
                    externalId: 'ext-2',
                    fetchedAt: new Date(),
                    temperature: 30.0,
                },
            ];

            mockWeatherService.findAll.mockResolvedValue(logs);

            const res = await controller.findAll();
            expect(mockWeatherService.findAll).toHaveBeenCalled();
            expect(res).toEqual(logs);
        });

        it('should return empty array when no logs exist', async () => {
            mockWeatherService.findAll.mockResolvedValue([]);

            const res = await controller.findAll();
            expect(res).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return a weather log by internal ID', async () => {
            const log = {
                _id: 'log1',
                externalId: 'ext-1',
                fetchedAt: new Date(),
                latitude: -9.747,
                longitude: -36.667,
                temperature: 25.0,
                humidity: 70.0,
                precipitationProbability: 20.0,
            };

            mockWeatherService.findById.mockResolvedValue(log);

            const res = await controller.findById('log1');
            expect(mockWeatherService.findById).toHaveBeenCalledWith('log1');
            expect(res).toEqual(log);
        });

        it('should return null when log not found by ID', async () => {
            mockWeatherService.findById.mockResolvedValue(null);

            const res = await controller.findById('nonexistent');
            expect(res).toBeNull();
        });
    });

    describe('findByExternalId', () => {
        it('should return a weather log by external ID', async () => {
            const log = {
                _id: 'log1',
                externalId: 'ext-123',
                fetchedAt: new Date(),
                latitude: -9.747,
                longitude: -36.667,
                temperature: 27.5,
                humidity: 65.0,
                precipitationProbability: 10.0,
            };

            mockWeatherService.findByExternalId.mockResolvedValue(log);

            const res = await controller.findByExternalId('ext-123');
            expect(mockWeatherService.findByExternalId).toHaveBeenCalledWith('ext-123');
            expect(res).toEqual(log);
        });

        it('should return null when log not found by external ID', async () => {
            mockWeatherService.findByExternalId.mockResolvedValue(null);

            const res = await controller.findByExternalId('nonexistent-ext');
            expect(res).toBeNull();
        });
    });
});