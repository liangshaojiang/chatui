 
import { ModelsRquest } from "@/utils/server/models";

export const config = {
  runtime: "edge",
  unstable_allowDynamic: [
    '/utils/server/**', // allows a single file 
   ]
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { key } = (await req.json()) as {
      key: string;
    };

    let models =await ModelsRquest(key);

    return new Response(JSON.stringify(models), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
