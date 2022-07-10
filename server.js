//共通データの保持や処理を行う
//実行コード：deno run --allow-net --allow-read --watch shiritori/server.js
import { serve } from "https://deno.land/std@0.138.0/http/server.ts"
import { serveDir } from "https://deno.land/std@0.138.0/http/file_server.ts";

let time_start = new Date().getTime();

const firstWordSet = {
  "normal":[
    "しりとり","りんご","かめ","らくだ","ちりとり","そうじき",
    "どうろ","つくえ","かべ","しんごう","びーる","りれー",
    "すいか","おうさま","しんせかい","ろくろくび","たつのおとしご"
  ],
  "reverse":[
    "ふうりん","かざん","せんすいかん","えいがかん","げんかん",
    "ろんどん","ほるん","ほうしゃせん","ばいおりん","かーてん",
    "ばくだん","みかん","あどれなりん","すけるとん","ぱそこん"
  ]
}
const firstWord = function(pattern,option=null) {
  switch(pattern){
      case 0:
        return "しりとり";
      case 1:
        return firstWordSet[option][Math.floor(Math.random()*firstWordSet[option].length)];
  }
}

let rooms = {};
for(let i of ["normal","reverse"]){
  rooms[i] = {};
  rooms[i].previousWord = firstWord(1,i);
  rooms[i].wordsHistory = [rooms[i].previousWord];
  rooms[i].updates = {"word":0};
}
console.log("Listening on http://localhost:8000");

serve(async (req) => {
  const pathname = new URL(req.url).pathname;
  if (pathname === "/shiritori"){
    if (req.method === "GET"){
      return new Response(JSON.stringify(rooms));
    }

    if (req.method === "POST") {
      const requestJson = await req.json();
      let datas = rooms[requestJson.room];
      if (requestJson.matter!="word")
        datas.updates[requestJson.matter] = new Date().getTime() - time_start;
      switch(requestJson.matter){
          case "word":
            const nextWord = requestJson.nextWord;
            const points = previousWordKeeper.comon;
            for (let i=0;i<points.length;i++){
              let point = points[i];
              if(point.detect(nextWord,requestJson.room))
                return new Response(point.prompt,{ status:point.status });
            }
            const uniquePoints=previousWordKeeper[requestJson.chainMode];
            for (let i=0;i<uniquePoints.length;i++){
              let point=uniquePoints[i];
              if(point.detect(nextWord,requestJson.room))
                return new Response(point.prompt,{ status:point.status });
            }
            datas.updates["word"] = new Date().getTime() - time_start;
            datas.wordsHistory.push(datas.previousWord=nextWord);
            break;
          case "reset":
            datas.previousWord = firstWord(1,requestJson.room);
            datas.wordsHistory = [datas.previousWord];
            ["word"].forEach(mt=>{
              datas.updates[mt] = new Date().getTime() - time_start;
            });
            return;
          case "test":
            switch(requestJson.num){
                case 0:
                  return new Response(JSON.stringify({"test":"test3"}));
                case 1:
                  return new Response(JSON.stringify({"test":{"test4":"test5"}}));
                case 2:
                  return new Response(JSON.stringify({"wH":datas.wordsHistory}));
                case 3:
                  console.log("kana > Uni : " + KanaToUnicode(7,0) + "," + "や".charCodeAt(0))
                  console.log("Uni > Kana : " + JSON.stringify(KanaFromUnicode("ゃ".charCodeAt(0))) + "," + ("や".charCodeAt(0)-"ぁ".charCodeAt(0)))
                  console.log("checker : " + String.fromCharCode(KanaToUnicodeJ(KanaFromUnicode("わ".charCodeAt(0)))))
                  return;
            }
            break;
          case "log":
            console.log(requestJson.content);
            return;
      }
      return new Response(datas.previousWord);
    }
  }
  return serveDir(req, {
    fsRoot: "shiritori/public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});

const previousWordKeeper = {
"comon":[
  {
    "detect": word=>word.length===0,
    "prompt": "なにか入力してください",
    "status": 400
  },
  {
    "detect": word=>!word.match(/^[ぁ-ゔァ-ヴー]*$/),
    "prompt": "ひらがなカタカナ以外は使用できません",
    "status": 400
  },
  {
    "detect": (word, room)=>rooms[room].wordsHistory.includes(word),
    "prompt": "その単語は既に出たようです",
    "status": 400
  }
],
"normal":[
  {
    "detect": word=>["ん","ン"].includes(word.charAt(word.length-1)),
    "prompt": "「ん」がついたので負けました",
    "status": 402
  },
  {
    "detect": (word, room)=>!isInterchangeable(rooms[room].previousWord, word),
    "prompt": "前の単語から続いていないと判断されました",
    "status": 400
  },
],
"reverse":[
  {
    "detect": (word, room)=>!isInterchangeable(word, rooms[room].previousWord),
    "prompt": "次の単語に続かないと判断されました",
    "status": 400
  }
]
}

const toFlat = function(str){
  let result="";
  for(let i=0;i<str.length;i++)
    if(str.charAt(i).match(/^[ァ-ヴ]*$/))
      result+=String.fromCharCode(str.charCodeAt(i)-96);
    else
      result+=str.charAt(i);
  return result;
}

const isInterchangeable=function(ori,tar){// <!> ori : str, tar : char
  ori = toFlat(ori);
  tar = toFlat(tar);
  let c = ori.charAt(ori.length-1);
  let c2 = ori.charAt(ori.length-2);
  switch(c){
    case "ー":
      if(stageOfKana(c2)==tar.charAt(0))//段が同じなら許容
        return true;
      return isInterchangeable(ori.slice(0,-1),tar);//ひとつ前の文字が同じなら許容
    case "ゃ":
    case "ゅ":
    case "ょ":
    case "ぁ":
    case "ぃ":
    case "ぅ":
    case "ぇ":
    case "ぉ":
      console.log(c.charCodeAt(0)-tar.charCodeAt(0))
      if(tar.charCodeAt(0)-c.charCodeAt(0)==1)
          return true;
      if(c.charCodeAt(0)-tar.charCodeAt(1)==0) //読みが同じなら許容
          return isInterchangeable(ori.slice(0,-1),tar);
      return false; //小文字から始まる単語を非許容
    default:
      if(c==tar.charAt(0))//同じ文字なら許容
        return true;
      let pos = KanaFromUnicode(c.charCodeAt(0));
      if([1,2].includes(pos.Bac)&&[1,2,3,5].includes(pos.Row)){//濁点などがついているか判定
        if(String.fromCharCode(KanaToUnicode(pos.Row,pos.Stg))==tar.charAt(0))//濁点の除去を許容
          return true;
      }
      return false;
  }
}

const stageOfKana=function(c){
  return ["あ","い","う","え","お"][KanaFromUnicode(c.charCodeAt(0)).Stg];
}

const KanaToUnicode = function(Row,Stg,Bac=0){
  const X = 5*Row+Stg;
  return 12353 + X+Bac +
    ((Row<4)?X:20) +
    (X>17) +
    ((Row==5)?(2*Stg):((Row>5)*10)) +
    (X>39) +
    (X>45) -
    (X>47)
}
const KanaToUnicodeJ = function(J){
  return KanaToUnicode(J.Row,J.Stg,J.Bac);
}

const KanaFromUnicode = function(uc){
  let nuc = uc - "ぁ".charCodeAt(0);
  let k = 1;
  let b = (nuc>36)-2*((nuc>67)+(nuc>69))-(nuc>79);
  if(nuc<41)
    k+=1;
  else
    b+=20;
  if(nuc>60)
    b+=10;
  else if(45<nuc){
    k+=2;
    b-=50;
  }
  if(nuc>71)
    b+=5;
  else if(65<nuc){
    k+=1;
    b-=35;
  }
  if(nuc>78)
    b+=1;
  else if(76<nuc){
    k+=1;
    b-=45;
  }
  const X1 = nuc-b;
  const Bac = X1%k;
  const X2 = (X1-Bac)/k;
  const Stg = X2%5;
  const Row = (X2-Stg)/5;
  console.log({nuc,k,b,X1,X2})
  return {Row,Stg,Bac};
}