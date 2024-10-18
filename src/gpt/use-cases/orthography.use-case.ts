import OpenAI from "openai";

interface Options{
    prompt: string;
}


export const orthographyCheckUseCase = async (openai: OpenAI, options : Options ) => {

    const { prompt } = options;

    const completion = await openai.chat.completions.create({
        messages:[{
             role: "system", 
             content: `Te seran proveidos en ingles textos con posibles errores ortograficos y gramaticales,
             debes responder en formato JSON,
             Tu tarea es corregirlos y retornar informacion soluciones,
             tambien debes de dar un porcentaje de acierto por el usuario,
             Si no hay errores, debes retornar un mensaje de felicitaciones.
             
             Ejemplo de Salida:
             {
                userScore: number,
                error: string[], // ['error -> solucion]
                message: string, // Usa emojis y texto para felicitar
             }
             
             
             `

             
            },
            {
                role: 'user',
                content: prompt
            },
        ],
          
             model: "gpt-3.5-turbo",
             temperature: 0.3,
             max_tokens: 150,
    });

    //console.log(completion);
    const jsonResp = JSON.parse(completion.choices[0].message.content);
    return  jsonResp;

 
}