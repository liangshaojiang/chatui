import { Message, OpenAIModel, OpenAIModelID, OpenAIModels  } from "@/types"; 
import { getApiKey } from "@/utils/server/keyHelper";


export const ModelsRquest = async (key: string) => {
 
 
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`//getApiKey()
      }
    });

    if (response.status !== 200) {
      throw new Error("OpenAI API returned an error");
    }

    const json = await response.json();

    const models: OpenAIModel[] = json.data
      .map((model: any) => {
        for (const [key, value] of Object.entries(OpenAIModelID)) {
          if (value === model.id) {
            return {
              id: model.id,
              name: OpenAIModels[value].name
            };
          }
        }
      })
    .filter(Boolean);
  
  
 

  return models;
};
