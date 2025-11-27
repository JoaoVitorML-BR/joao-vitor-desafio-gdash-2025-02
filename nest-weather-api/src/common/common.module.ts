import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OpenRouterService } from './service/openrouter.service';

@Global()
@Module({
    imports: [
        HttpModule.register({
            timeout: 30000,
            maxRedirects: 5,
        }),
    ],
    providers: [OpenRouterService],
    exports: [OpenRouterService],
})
export class CommonModule { }
