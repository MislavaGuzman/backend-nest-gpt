import { Controller, Post, Body, Res, HttpStatus, Get, Param, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GptService } from './gpt.service';
import { ImageGenerationDto, ImageVariationDto, OrthographyDto, ProsConsDisusserDto, TextToAudioDto, TranslateDto } from './dto';
import  type { Response } from 'express';
import { diskStorage } from 'multer';
import { AudioToTextDto } from './dto/audio-to-text.dto';
import { FILE } from 'dns';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('orthography-check')
  orthographyCheck(
    @Body() orthographyDto : OrthographyDto,
  ){
    return  this.gptService.orthographyCheck(orthographyDto);
  }


  @Post('pros-cons-discusser')
  prosConsDiscusser(
    @Body() prosConsDiscusserDto : ProsConsDisusserDto,

  ){
      return this.gptService.prosConsDisusser(prosConsDiscusserDto);
    
    }

    
  @Post('pros-cons-discusser-stream')
  async prosConsDiscusserStream(
    @Body() prosConsDiscusserDto : ProsConsDisusserDto, 
    @Res() res: Response,

  ){
      const stream = await  this.gptService.prosConsDisusserStream(prosConsDiscusserDto);
       res.setHeader('Content-Type', 'application/json');
       res.status( HttpStatus.OK)

       for await (const chunk of stream ){
         const piece = chunk.choices[0].delta.content || '';
         //console.log(piece);
         res.write(piece);
       }
       res.end();
    }


    @Post('translate')
    translateText(
      @Body() translateDto : TranslateDto,
    ){
      return this.gptService.translateText(translateDto);
    }

    @Post('text-to-audio')
    async textToAudio(
      @Body() textToAudio : TextToAudioDto,
      @Res() res : Response 
    ){
      const filePath = await this.gptService.textToAudio(textToAudio);

      res.setHeader('Content-Type', 'audio/mp3');
      res.status(HttpStatus.OK);
      res.sendFile(filePath);
    }


    


    @Get('text-to-audio/:fileId')
    async textToAudioGetter(
      @Res() res : Response,
      @Param('fileId') fileId : string,
    ){
      const filePath = await this.gptService.textToAudioGetter(fileId);

      res.setHeader('Content-Type', 'audio/mp3');
      res.status(HttpStatus.OK);
      res.sendFile(filePath);
    }

    @Post('audio-to-text')
    @UseInterceptors(
      FileInterceptor('file',{
        storage: diskStorage({
          destination: './generated/',
          filename: (req, file, callback) => {
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${new Date().getTime()}.${ fileExtension }`; //32313.mp3
            return callback(null, fileName);
          }
        })
      })
    )
    async audioToText(
      @UploadedFile(
        new ParseFilePipe({
          validators: [
            new MaxFileSizeValidator({ maxSize: 1000 * 1024 * 5, message : 'File is bigger than 5 mb' }),
            new FileTypeValidator({ fileType: 'audio/*' })
          ]
        })
      ) file: Express.Multer.File, 
      @Body() audioToTextDto : AudioToTextDto,
    ){
      
       return this.gptService.audioToText(file, audioToTextDto);
    }


    @Post('image-generation')
    async imageGeneration(
      @Body() imageGenerationDto : ImageGenerationDto
    ){
      return await this.gptService.ImageGeneration(imageGenerationDto);
    }


    @Get('image-generation/:filename')
    async getGenerated(@Res() res: Response, @Param('filename') fileName: string) {
      const filePath = this.gptService.getGeneratedImage(fileName);
      res.status(HttpStatus.OK);
      res.sendFile(filePath);
    }
  
    @Post('image-variation')
    async imageVariation(
      @Body() imageVariationDto : ImageVariationDto
    ){
      return await this.gptService.generateImageVariation(imageVariationDto);
    }
  


   
}
