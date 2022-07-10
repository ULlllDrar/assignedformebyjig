//個別データの保持,サーバーとの情報交換,及びuiの管理を行う
let localUpdates={
    "previousWord":"",
    "wordsHistory":[],
    "updates":{}
};
let uis = {
    "testButton": document.getElementById("test"),
    "nextWordsSendButton": document.querySelector("#nextWordSendButton"),
    "out": document.querySelector("#out"),
    "nextWordInput": document.querySelector("#nextWordInput"),
    "previousWord": document.querySelector("#previousWord"),
    "hist": document.querySelector("#history"),
    "resetButton": document.querySelector("#resetButton")
};
let playingData;
let room;

uis.testButton.onclick = async (event)=>{
    let graf=[];
    let str = "なにぬねのはひふへほん";
    for (let i=0;i<str.length;i++) {
        graf.push(str.charAt(i)+":"+((Math.floor((str.charCodeAt(i)-3)/2))%5))
    }
    alert(graf.join("\n"));

    let graf2=[];
    let str2_1 = "やゆよあいうえお";
    let str2_2 = "ゃゅょぁぃぅぇぉ";
    for (let i=0;i<str2_1.length;i++) {
        graf2.push(str2_1.charAt(i)+":"+(str2_1.charCodeAt(i)-str2_2.charCodeAt(i)));
    }
    alert(graf2.join("\n"));
    
    alert(playingData);
    await fetch("/shiritori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "num":3 ,"matter":"test" })
    });
    return;
};

var ww = document.getElementById("words");
var wws = ww.getElementsByClassName("word");
let chainMode="normal";

window.onload = async (event) => {
    playingData={"mode":(location.search??"?").substring(1)};
    room = playingData.mode;
    switch(playingData.mode){
        default:
        case "normal":
            break;
        case "reverse":
            chainMode = "reverse";
            ww.insertBefore(wws[0],wws[2]);
            ww.insertBefore(wws[2],wws[0]);
            break;
        case "battle":
            break;
    }
    setInterval(updateChecker,500);
    updateChecker();
};

uis.nextWordsSendButton.onclick = async (event) => {
    const nextWord = uis.nextWordInput.value;
    const response = await fetch("/shiritori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "matter":"word", nextWord, chainMode, room})
    });
    if (response.status / 100 !== 2) {
        alert(await response.text());
        if(response.status==402){
            history.back(-2);
        }else
            return;
    }
    uis.nextWordInput.value = "";
    updateChecker();
};

uis.resetButton.onclick = async (event) => {
    await fetch("/shiritori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "matter":"reset", room })
    });
    updateChecker();
};

document.onkeydown = async (event)=>{
    switch(event.key){
        case "Enter":
            uis.nextWordsSendButton.onclick();
            break;
    }
}

uis.out.onclick = async(event)=>{
    history.back(-1);
}

const updateChecker = async()=>{
    const update = await fetch("/shiritori");
    const newdatas = JSON.parse(await update.text())[room];
    const news = newdatas.updates;

    Object.keys(news).forEach(key=>{
        if(!(key in localUpdates.updates)||news[key]>localUpdates.updates[key])
          switch( key ) {
            case "word":
                uis.previousWord.innerText = newdatas.previousWord;
                emitParticles();
                if(localUpdates.wordsHistory.length > newdatas.wordsHistory.length){
                    uis.hist.innerText = "";
                    localUpdates.wordsHistory=[]
                }
                for(let i = localUpdates.wordsHistory.length; i<newdatas.wordsHistory.length; i++){
                    let li = document.createElement("li");
                    li.innerText = newdatas.wordsHistory[i];
                    uis.hist.appendChild(li);
                }
                return;
            case "reset":
                localUpdates.updates={};
                return;
        }
    })
    localUpdates = Object.assign({},newdatas);
}

const log = async(content) => {
    await fetch("/shiritori",{
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content ,"matter":"log", room })
    })
}

const center = document.getElementsByClassName("center")[0];

// クリック時のアニメーション
const emitParticles = async () => {
    // div.dotをCOUNT個作成
    const COUNT = 40;
    const dots = createElementsWithClass(COUNT, "div", "dot");
    appendAll(center, dots); // 画面に表示

    const animations = dots.map((dot) => {
      const angle = 360 * Math.random(); // 角度
      const dist = 100 + Math.random() * 50; // 飛距離 ... 100〜150
      const size = 0.5 + Math.random() * 2; // サイズ ... 0.5〜2.5
      const hue = 30 + Math.random() * 25; // 色相 ... 30〜55
      dot.style.backgroundColor = `hsl(${hue}.60%,90%)`;
      return dot.animate(
        [
          {
            transform: `rotate(${angle}deg) translateX(0px) scale(${size})`,
            opacity: 1
          },
          {
            transform: `rotate(${angle}deg) translateX(${dist}px) scale(${size})`,
            opacity: 1,
            offset: 0.8
          },
          {
            transform: `rotate(${angle}deg) translateX(${dist}px) scale(${size})`,
            opacity: 0
          }
        ],
        {
          duration: 700 * Math.random()
        }
      );
    });

    // 全てのアニメーションが終わるまで待つ
    await Promise.all(animations.map((anim) => anim.finished));
    removeAll(dots); // 削除
  };
  
const appendAll = (parent, elems) => {
    elems.forEach(elem => parent.appendChild(elem))
}
  
const removeAll = (elems) => {
    elems.forEach(elem => elem.parentNode?.removeChild(elem))
}
  
const createElementsWithClass = (count, tagName = 'div', className = '') => {
    return Array(count)
      .fill(0)
      .map(() => {
        const elem = document.createElement(tagName)
        elem.className = className
        return elem
      });
}