import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
    OpenRouterMessage,
    OpenRouterRequest,
    OpenRouterResponse,
} from '../interfaces/openrouter.interface';

@Injectable()
export class OpenRouterService {
    private readonly logger = new Logger(OpenRouterService.name);
    private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    private readonly apiKey: string | undefined;
    private readonly siteUrl: string;
    private readonly siteName: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
        this.siteUrl = this.configService.get<string>(
            'SITE_URL',
            'http://localhost:9090',
        );
        this.siteName = this.configService.get<string>(
            'SITE_NAME',
            'GDASH Weather API',
        );

        if (!this.apiKey) {
            this.logger.warn(
                'OPENROUTER_API_KEY not configured. AI insights will not be available.',
            );
        }
    }

    async generateCompletion(
        messages: OpenRouterMessage[],
        model: string = 'x-ai/grok-4.1-fast:free',
        options?: { temperature?: number; max_tokens?: number },
    ): Promise<string> {
        if (!this.apiKey) {
            throw new Error('OpenRouter API key is not configured');
        }

        try {
            const requestBody: OpenRouterRequest = {
                model,
                messages,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.max_tokens ?? 1000,
            };

            this.logger.debug(`Sending request to OpenRouter with model: ${model}`);

            const response = await firstValueFrom(
                this.httpService.post<OpenRouterResponse>(
                    this.apiUrl,
                    requestBody,
                    {
                        headers: {
                            Authorization: `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': this.siteUrl,
                            'X-Title': this.siteName,
                        },
                    },
                ),
            );

            const content = response.data.choices[0]?.message?.content;

            if (!content) {
                throw new Error('No content in OpenRouter response');
            }

            this.logger.debug(
                `OpenRouter response received. Tokens used: ${response.data.usage.total_tokens}`,
            );

            return content;
        } catch (error) {
            this.logger.error('Error calling OpenRouter API', error);
            throw new Error(`Failed to generate AI completion: ${error.message}`);
        }
    }
}