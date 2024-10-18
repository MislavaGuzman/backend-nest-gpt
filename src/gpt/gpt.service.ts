import { Injectable, NotFoundException } from '@nestjs/common';
import { orthographyCheckUseCase } from './use-cases/orthography.use-case';
import { ImageVariationDto, OrthographyDto, ProsConsDisusserDto, TextToAudioDto, TranslateDto } from './dto';
import OpenAI from 'openai';
import* as  path from "path";
import* as  fs from "fs";
import { ImageVariationUseCase, audioToTextUseCase, prosConsDiscusserStreamUserCase, prosConsDiscusserUserCase, textToAudioUseCase, translateUseCase } from './use-cases';
import { AudioToTextDto } from './dto/audio-to-text.dto';
import { imageGenerationUseCase } from './use-cases/image-generation.use-case';
import { ImageGenerationDto } from './dto/image-generation.dto';

@Injectable()
export class GptService {

    private openai = new OpenAI({
        apiKey : process.env.OPENAI_API_KEY,
    })

    //Solo va llamar casos de uso
   async orthographyCheck(orthographyDto:OrthographyDto ){
        return await orthographyCheckUseCase( this.openai,{
            prompt: orthographyDto.prompt
        });
    }

    async prosConsDisusser({ prompt } : ProsConsDisusserDto ){
        return await prosConsDiscusserUserCase(this.openai, {prompt})
    }

    async prosConsDisusserStream({ prompt } : ProsConsDisusserDto ){
        return await prosConsDiscusserStreamUserCase(this.openai, {prompt})
    }


    async translateText({ prompt, lang } : TranslateDto ){
        return await translateUseCase(this.openai, {prompt, lang })
    }

    async textToAudio({ prompt, voice  } : TextToAudioDto ){
        return await textToAudioUseCase(this.openai, {prompt, voice })
    
    }

    async textToAudioGetter( fileId : string     ){
        
        const filePath = path.resolve(__dirname, '../../generated/audios/', `${fileId}.mp3`);

        const wasFound = fs.existsSync(filePath);


        if( !wasFound ) throw  new NotFoundException(`File ${fileId} not found`);
        return filePath;
    }

    async audioToText(
         audioFile: Express.Multer.File, 
         audioToTextDto: AudioToTextDto,
        ){

        const { prompt } = audioToTextDto;
        return await audioToTextUseCase(this.openai, { audioFile, prompt });
    }

    async ImageGeneration(imageGenerationDto : ImageGenerationDto){
        return await  imageGenerationUseCase( this.openai, { ...imageGenerationDto});
      }
      

      getGeneratedImage(fileName: string ){
    
      

       if (typeof fileName !== 'string' || fileName.trim() === '') {
        throw new NotFoundException('Invalid file name');
    }
    
        const filePath = path.resolve(__dirname, 'generated', 'images', fileName);
        const exists = fs.existsSync(filePath);

        if(!exists){
             throw new NotFoundException('File not found');
        }

        console.log({filePath});
        return filePath;
      }

      async generateImageVariation( { baseImage }: ImageVariationDto ) {
        return ImageVariationUseCase( this.openai, { baseImage });

      }

}
