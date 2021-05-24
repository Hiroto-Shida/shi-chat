//-------------------------------------
// Socket.ioサーバへ接続
//-------------------------------------
const socket = io();

// 参加者名前表示の関数
function parNamePrint(list) {
const par_name = document.querySelector("#par-name");
par_name_str = '';
for (let i = 0; i < list.length; i++) {
    par_name_str += list[i] + ', ';
}
par_name.innerHTML = `${par_name_str}`;
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
const name = document.querySelector("#name");
const room_name = document.querySelector("#room_name");
if( (name.value === "") || (room_name.value === "") ){
    return(false);
}

// Socket.ioサーバへ送信
socket.emit("name post", {room_name: room_name.value, name: name.value});

// 名前入力を非表示，チャットを表示
document.querySelector("#name-post").style.display = "none"
document.querySelector("#chat-box").style.display = "block"

// 自分のルーム名・名前を表示
document.querySelector("#room-name").innerHTML = `${room_name.value}`;
document.querySelector("#user-name").innerHTML = `${name.value}`;

// 名前ボックスを空にする
room_name.value = "";
name.value = "";

document.querySelector("#msg").focus();
});

/**
 * [イベント] 名前が決定された
 */
socket.on("membername-post", (list)=>{
parNamePrint(list);
});

/**
 * [イベント] チャットを送信した
 */
document.querySelector("#frm-post").addEventListener("submit", (e)=>{
// 規定の送信処理をキャンセル(画面遷移しないなど)
e.preventDefault();

// ルーム名・送信者名前・入力内容 を取得する
const room_name = document.querySelector("#room-name");
const name = document.querySelector("#user-name");
const msg = document.querySelector("#msg");
if( msg.value === "" ){
    return(false);
}

const list = document.querySelector("#msglist");
const tr1 = document.createElement("tr");
const tr2 = document.createElement("tr");

const td = document.createElement("td");
td.setAttribute("rowspan", "2");
td.classList.add('chat-icon-box');

const td_name = document.createElement("td");
// td_name.classList.add('chat-name');
td_name.classList.add('text-right');

const td_icon = document.createElement("td");
td_icon.setAttribute("rowspan", "2");
td_icon.setAttribute("valign", "top");
td_icon.classList.add('chat-icon-box');
const div_icon = document.createElement("div");
div_icon.classList.add('chat-icon');
td_icon.appendChild(div_icon);

const td_text = document.createElement("td");
td_text.classList.add('text-right');
const p_text = document.createElement("p");
p_text.classList.add('chat-text');

td_name.innerHTML = `${name.textContent}`;
p_text.innerHTML = `${msg.value}`;
td_text.appendChild(p_text);
tr1.appendChild(td);
tr1.appendChild(td_name);
tr1.appendChild(td_icon);
tr2.appendChild(td_text);
list.appendChild(tr1);
list.appendChild(tr2);

// Socket.ioサーバへ送信
socket.emit("post", {room_name: room_name.textContent, name: name.textContent, text: msg.value});

// 一番下までスクロール
const container = document.querySelector(".chat-main-box");
container.scrollTop = container.scrollHeight;

// チャットボックスを空にする
msg.value = "";
});

/**
 * [イベント] 誰かが発言した
 */
socket.on("member-post", (msg)=>{
const list = document.querySelector("#msglist");
const tr1 = document.createElement("tr");
const tr2 = document.createElement("tr");

const td_icon = document.createElement("td");
td_icon.setAttribute("rowspan", "2");
td_icon.setAttribute("valign", "top");
td_icon.classList.add('chat-icon-box');
const div_icon = document.createElement("div");
div_icon.classList.add('chat-icon');
td_icon.appendChild(div_icon);

const td_name = document.createElement("td");
// td_name.classList.add('chat-name');
td_name.classList.add('text-left');

const td = document.createElement("td");
td.setAttribute("rowspan", "2");
td.classList.add('chat-icon-box');

const td_text = document.createElement("td");
td_text.classList.add('text-left');
const p_text = document.createElement("p");
p_text.classList.add('chat-text');

td_name.innerHTML = `${msg.name}`;
p_text.innerHTML = `${msg.text}`;
td_text.appendChild(p_text);
tr1.appendChild(td_icon);
tr1.appendChild(td_name);
tr1.appendChild(td);
tr2.appendChild(td_text);
list.appendChild(tr1);
list.appendChild(tr2);

// 一番下までスクロール
const container = document.querySelector(".chat-main-box");
container.scrollTop = container.scrollHeight;

});

/**
 * [イベント] ページの読込み完了
 */
window.onload = ()=>{
// テキストボックスを選択する
document.querySelector("#room_name").focus();
let style = "<link rel='stylesheet' href='style.css'>";
$('head:last').after(style);
}