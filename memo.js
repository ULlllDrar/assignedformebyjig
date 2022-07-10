console.log("");
//コードの一時隔離用

let uis = {
    "testButton": document.getElementById("test"),
    "nextWordsSendButton": document.querySelector("#nextWordSendButton"),
    "nextWordInput": document.querySelector("#nextWordInput"),
    "previousWord": document.querySelector("#previousWord"),
    "hist": document.querySelector("#history")
};

const previousWordKeeper = [
    {
        "detect": word=>word.length===0,
        "prompt": "なにか入力してください",
        "status": 401
    },
    {
        "detect": word=>datas.previousWord.charAt(datas.previousWord.length-1)!== word.charAt(0),
        "prompt": "前の単語に続いていないと判断されました",
        "status": 400
    },
    {
        "detect": word=>word.charAt(word.length-1)==='ん',
        "prompt": "「ん」がついたので負けました",
        "status": 402
    },
    {
        "detect": word=>datas.wordsHistory.includes(word),
        "prompt": "その単語は既に出たようです",
        "status": 403
    }
]