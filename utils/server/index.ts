import { Message, OpenAIModel } from "@/types";
import { createParser, ParsedEvent, ReconnectInterval } from "eventsource-parser";


const apikey = "03702Z01901G01C02R02G01J03502802802C02301I02602702I01Z02802W02503402H02C01F01U03002Q02Z01Y02202V01F02C01T01J03A01Y03E01T02302F02002503403A03202302A02H02Y";
  // 字符串解密
  //  const fromCode= (str:String)=> {
  //           //定义密钥，36个字母和数字
  //           var key = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  //           var len = key.length;  //获取密钥的长度
  //           var b, b1, b2, b3, d = 0, s;  //定义临时变量
  //           s = new Array(Math.floor(str.length / 3));  //计算加密字符串包含的字符数，并定义数组
  //           b = s.length;  //获取数组的长度
  //           for (var i = 0; i < b; i ++) {  //以数组的长度循环次数，遍历加密字符串
  //               b1 = key.indexOf(str.charAt(d));  //截取周期内第一个字符串，计算在密钥中的下标值
  //               d ++;
  //               b2 = key.indexOf(str.charAt(d));  //截取周期内第二个字符串，计算在密钥中的下标值
  //               d ++;
  //               b3 = key.indexOf(str.charAt(d));  //截取周期内第三个字符串，计算在密钥中的下标值
  //               d ++;
  //               s[i] = b1 * len * len + b2 * len + b3  //利用下标值，反推被加密字符的Unicode编码值
  //           }
  //           b = eval("String.fromCharCode(" + s.join(',') + ")");  // 用fromCharCode()算出字符串
  //           return b ;  //返回被解密的字符串
  //       }

const fromCode = (str: String) => {
  var key = "123";
  var len = key.length;
  var b, b1, b2, b3, d = 0, s;
  s = new Array(Math.floor(str.length / 3));
  b = s.length;
  for (var i = 0; i < b; i++) {
    b1 = key.indexOf(str.charAt(d));
    d++;
    b2 = key.indexOf(str.charAt(d));
    d++;
    b3 = key.indexOf(str.charAt(d));
    d++;
    s[i] = b1 * len * len + b2 * len + b3;
  }
  b = String.fromCharCode(...s);
  return b;
}
export const OpenAIStream = async (model: OpenAIModel, systemPrompt: string, key: string, messages: Message[]) => {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${fromCode(apikey)}`//key ? key : process.env.OPENAI_API_KEY
    },
    method: "POST",
    body: JSON.stringify({
      model: model.id,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...messages
      ],
      max_tokens: 1000,
      temperature: 0.0,
      stream: true
    })
  });

  if (res.status !== 200) {
    const statusText = res.statusText; 
    throw new Error(`OpenAI API returned an error: ${statusText}`);
  }





  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    }
  });

  return stream;
};
