import OpenAI from "openai";

interface Options {

    baseImage: string;
}

export const ImageVariationUseCase = async(
        
    openai: OpenAI, 
    options: Options,
) => {
    const { baseImage } = options; 
    console.log({baseImage});
    return baseImage; 
}