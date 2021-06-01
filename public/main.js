//-------------------------------------
// Socket.ioサーバへ接続
//-------------------------------------
const socket = io();

let clientName;

// 参加者名表示の関数
function parNamePrint(list) {
    const par_name = document.querySelector("#par-name");
    par_name.innerHTML = '';
    let first = true;
    for (let i = 0; i < list.length; i++) {
        const span = document.createElement("span");
        span.classList.add('par-name');
        if (list[i] == clientName && first) {
            span.classList.add('par-myname'); // 自分の名前を強調
            first = false;
        }
        span.innerHTML = list[i];
        par_name.appendChild(span);
    }
}

// 送信された(した)チャットを表示する関数
function chatPrint(direction, user_name, text, time) {
    const list = document.querySelector("#msglist");
    const tr1 = document.createElement("tr");
    const tr2 = document.createElement("tr");

    const td_icon = document.createElement("td");
    td_icon.setAttribute("rowspan", "2");
    td_icon.classList.add('chat-icon-box');
    const td_name = document.createElement("td");
    const td_text = document.createElement("td");
    const p_text = document.createElement("p");
    p_text.classList.add('chat-text');

    // 送信時刻
    const span_time = document.createElement("span");
    span_time.classList.add('emit-time');
    span_time.innerHTML = ` ${time} `;

    if (direction == "to_other") {
        td_name.classList.add('text-right');
        td_text.classList.add('text-right');

        td_name.innerHTML = `${user_name}`;
        td_name.insertBefore(span_time, td_name.firstChild);
    }else if(direction == "to_me"){
        td_icon.setAttribute("valign", "top");
        const div_icon = document.createElement("div");
        div_icon.classList.add('chat-icon');
        td_icon.appendChild(div_icon);
        td_name.classList.add('text-left');
        td_text.classList.add('text-left');

        td_name.innerHTML = `${user_name}`;
        td_name.appendChild(span_time);
    }

    p_text.innerHTML = `${text}`;
    td_text.appendChild(p_text);
    tr1.appendChild(td_icon);
    tr1.appendChild(td_name);
    tr2.appendChild(td_text);
    list.appendChild(tr1);
    list.appendChild(tr2);
}

/**
 * [イベント] 接続数表示
 */
let count = document.querySelector("#count");
// ユーザー接続時
socket.on('user connect', (num)=>{
    count.innerHTML = `${num}`;
    // console.log(num);
});
// ユーザー切断時
socket.on('user disconnect', (num)=>{
    count.innerHTML = `${num}`;
    // console.log(num);
});

// 同ルーム内のユーザー切断時，同ルーム内のユーザーリストを更新
socket.on('update usernum', (list)=>{
    parNamePrint(list);
});

/**
 * [イベント] room名・名前が入力され，「参加」が押された
 */
document.querySelector("#name-post").addEventListener("submit", (e)=>{
    // 規定の送信処理をキャンセル(画面遷移しないなど)
    e.preventDefault();

    // 入力されたroom名・名前を取得する
    const user_name = document.querySelector("#name");
    const room_name = document.querySelector("#room_name");
    if( (user_name.value === "") || (room_name.value === "") ){
        return(false);
    }
    clientName = user_name.value; // 名前をグローバル変数に保存

    // Socket.ioサーバへ送信
    socket.emit("name post", {room_name: room_name.value, name: user_name.value});

    // 名前入力を非表示．チャットを表示
    document.querySelector("#name-post").style.display = "none"
    document.querySelector("#chat-box").style.display = "flex"

    // 自分のルーム名・名前を表示
    document.querySelector("#room-name").innerHTML = `${room_name.value}`;
    // document.querySelector("#user-name").innerHTML = `${user_name.value}`;

    // 名前ボックスを空にする
    room_name.value = "";
    user_name.value = "";

    document.querySelector("#msg").focus();
});

/**
 * [イベント] 名前が決定された
 */
socket.on("membername-post", (list)=>{
    parNamePrint(list);
});

/**
 * [イベント] 自分がチャットを送信した
 */
document.querySelector("#frm-post").addEventListener("submit", (e)=>{
    // 規定の送信処理をキャンセル(画面遷移しないなど)
    e.preventDefault();

    // ルーム名・送信者名前・入力内容 を取得する
    const room_name = document.querySelector("#room-name");
    // const user_name = document.querySelector("#user-name");
    const msg = document.querySelector("#msg");
    if( msg.value === "" ){
        return(false);
    }

    // 送信時間を取得
    let now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let nowtime = hour+':'+minute;

    // Socket.ioサーバへ送信
    socket.emit("post", {room_name: room_name.textContent, name: clientName, text: msg.value, time: nowtime});

    // 自分が送信したメッセージを表示
    chatPrint("to_other", clientName, msg.value, nowtime);

    // チャットボックスを空にする
    msg.value = "";

    // 送信ボタンを薄くする
    document.getElementById('submit').classList.remove('submit-button');

    // 最新を表示するため一番下までスクロール
    const container = document.querySelector(".chat-main-box");
    container.scrollTop = container.scrollHeight;
});

/**
 * [イベント] 誰かがチャットを送信した
 */
socket.on("member-post", (msg)=>{
    // 誰かが送信したメッセージを表示
    chatPrint("to_me", msg.name, msg.text, msg.time);

    // 最新を表示するため一番下までスクロール
    const container = document.querySelector(".chat-main-box");
    container.scrollTop = container.scrollHeight;
});

/**
 * スクロール制御
 */
let scrollControll = function(event) {
  let scrollarea = $(event.target).closest('.chat-main-box');
  if (scrollarea.length > 0 && scrollarea.scrollTop() != 0 && scrollarea.scrollTop + scrollarea.clientHeight !== scrollarea.scrollHeight) {
    event.stopPropagation();
    // console.log("OK!!!!!")
  }else{
    // console.log("だめ")
    event.preventDefault();
  }
};

document.addEventListener('touchmove', scrollControll, { passive: false }); // スクロール制限(SP)
document.addEventListener('mousewheel', scrollControll, { passive: false }); // スクロール制限(PC)

let scrollarea = document.querySelector('.chat-main-box');
scrollarea.scrollTop = 1;
scrollarea.addEventListener('scroll', function() {
  if (scrollarea.scrollTop === 0) {
    scrollarea.scrollTop = 1;
  }else if (scrollarea.scrollTop + scrollarea.clientHeight === scrollarea.scrollHeight) {
    scrollarea.scrollTop = scrollarea.scrollTop - 1;
  }
});


// チャット入力ボックスに１文字以上入力されたら送信可能
window.addEventListener('DOMContentLoaded',function(){
    document.getElementById('submit').disabled = true;
    document.getElementById('msg').addEventListener('keyup',function(){
        if (this.value.length < 1) {
            document.getElementById('submit').disabled = true;
            document.getElementById('submit').classList.remove('submit-button');
        } else {
            document.getElementById('submit').disabled = false;
            document.getElementById('submit').classList.add('submit-button');
        }
    },false);
    document.getElementById('msg').addEventListener('change',function(){
        if (this.value.length < 1) {
            document.getElementById('submit').disabled = true;
            document.getElementById('submit').classList.remove('submit-button');
        }
    },false);
},false);
    


/**
 * [イベント] ページの読込み完了
 */
window.onload = ()=>{
    // テキストボックスを選択する
    document.querySelector("#room_name").focus();
    let style = "<link rel='stylesheet' href='style.css'>";
    $('head:last').after(style);
}