const express = require("express");
const app  = express();
const http = require("http").createServer(app);
const io   = require("socket.io")(http);
const PORT = process.env.PORT || 5000;
let room_list = {};
// let room_list = {   "falkfagw": ["tanaka", "room1"],
//                     "woeimwvd": ["suzuki", "room1"],
//                     "wmmpapla": ["yamada", "room2"],
//                  };

/**
 * 公開フォルダの指定
 */
app.use(express.static(__dirname + '/public'));

/**
 * [イベント] ユーザーが接続
 */
io.on("connection", (socket)=>{
  let room_name;
  // ユーザが接続された時
  io.emit('user connect', socket.client.conn.server.clientsCount);
  console.log("---ユーザーが接続しました---");
  console.log('全コネクション数',socket.client.conn.server.clientsCount);

  // room名・名前が送信された時
  socket.on("name post", (msg)=>{
    room_name = msg.room_name; // room名前
    socket.join(room_name); // 入力されたルーム名のルームに参加

    // socket.idに対応する 名前・ルーム を登録
    room_list[socket.id] = [msg.name, msg.room_name];

    // 同じルーム内の名前リストを作成・更新
    same_room_id_list = Array.from(socket.adapter.rooms.get(room_name))
    same_room_name_list = [];
    for (let i = 0; i < same_room_id_list.length; i++) {
      same_room_name_list.push( room_list[same_room_id_list[i]][0] );
    }
    io.to(msg.room_name).emit("membername-post", same_room_name_list);

    console.log("---ユーザーがルームに入りました---");
    console.log("同ルーム内のidリスト：",same_room_id_list);
    console.log("ユーザーリスト",room_list);
    console.log("ルームメンバー名リスト",same_room_name_list);
  });

  // 文字が送信された時
  socket.on("post", (msg)=>{
    console.log("---文字が送信されました---");
    console.log("送信者のsocket.id, room名：", socket.rooms);
    console.log("ユーザーリスト：",room_list);
    // io.to(msg.room_name).emit("member-post", msg);
    socket.to(msg.room_name).emit("member-post", msg); //ルーム内の送信者以外に送信
  });

  // ユーザが切断された時
  socket.on('disconnect', ()=>{
    let room_name_xxx = room_list[socket.id];
    delete room_list[socket.id];
    console.log("---ユーザーが切断されました---");
    console.log("切断者の情報",room_name_xxx);
    console.log('全コネクション数', socket.client.conn.server.clientsCount);

    // ルーム内にだれもいない時以外
    let same_room_info = socket.adapter.rooms.get(room_name);
    if (same_room_info != null) {
      // 同じルーム内の名前リストを作成・更新
      same_room_id_list = Array.from(same_room_info);
      same_room_name_list = [];
      for (let i = 0; i < same_room_id_list.length; i++) {
        same_room_name_list.push( room_list[same_room_id_list[i]][0] );
      }
      io.to(room_name).emit('update usernum', same_room_name_list);
    }
    io.emit('user disconnect', socket.client.conn.server.clientsCount);
  });

});

/**
 * サーバを起動する
 */
http.listen(PORT, () =>{
  console.log(`Listening on ${ PORT }`)
});