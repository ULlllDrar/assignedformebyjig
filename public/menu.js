let page;
let pagesHistory = [];
let uis = {
    "backButton" : document.getElementById("back"),
    "heading" : document.getElementById("heading")
};

window.onload = async(event) =>{
    const btns = document.querySelectorAll("button[data-next-page]");
    btns.forEach((link)=>{
        link.onclick = async(event) => {
            const nextPage = link.dataset.nextPage;
            movePage(nextPage);
        }
    });
    page = "empty";
    movePage("top");
}

uis.backButton.onclick = async(event) => {
    pagesHistory.pop();
    updatePage();
}

const movePage = function(nextPage){
    pagesHistory.push(nextPage);
    updatePage();
}

const updatePage = function(){
    uis.backButton.style.visibility = 1 < pagesHistory.length ? "visible" : "hidden";
    document.getElementById(page).style.display = "none";
    page = pagesHistory[pagesHistory.length-1];
    const nextPageLayout = document.getElementById(page);
    log(JSON.stringify(pagesHistory));
    if(nextPageLayout){
        nextPageLayout.style.display = "inline";
        uis.heading.innerText = nextPageLayout.dataset.heading??page;
    }else{
        uis.heading.innerText = page;
        page = pagesHistory[pagesHistory.length-2];
    }
}

const log = async(content) => {
    await fetch("/shiritori",{
        method:"POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content ,"matter":"log","room":"normal" })
    })
}