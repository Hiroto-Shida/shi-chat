const app  = require("express")();
const http = require("http").createServer(app);
const io   = require("socket.io")(http);
const PORT = process.env.PORT || 5000;
let room_list = {};
// let room_list = {   "falkfagw": ["tanaka", "room1"],
//                     "woeimwvd": ["suzuki", "room1"],
//                     "wmmpapla": ["yamada", "room2"],
//                  };

/**
 * アクセスがあったら各ファイルを返却
 */
app.get("/", (req, res)=>{
  res.sendFile(__dirname + "/index.html");
});
app.get("/style.css", (req, res)=>{
  res.sendFile(__dirname + "/style.css");
});

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

    let tmp_room_list = [msg.name, msg.room_name];
    room_list[socket.id] = tmp_room_list;

    same_room_id_list = Array.from(socket.adapter.rooms.get(room_name))
    same_room_name_list = [];
    for (let i = 0; i < same_room_id_list.length; i++) {
      same_room_name = room_list[same_room_id_list[i]][0];
      same_room_name_list.push(same_room_name);
    }
    console.log("---ユーザーがルームに入りました---");
    console.log("同ルーム内のidリスト：",same_room_id_list);
    console.log("ユーザーリスト",room_list);
    console.log("ルームメンバー名リスト",same_room_name_list);
    io.to(msg.room_name).emit("membername-post", same_room_name_list);
  });

  // 文字が送信された時
  socket.on("post", (msg)=>{
    console.log("---文字が送信されました---");
    console.log("送信者のsocket.id, room名：", socket.rooms);
    console.log("ユーザーリスト：",room_list);
    io.to(msg.room_name).emit("member-post", msg);
  });

  // ユーザが切断された時
  socket.on('disconnect', ()=>{
    let room_name_xxx = room_list[socket.id];
    delete room_list[socket.id];
    console.log("---ユーザーが切断されました---");
    console.log("切断者の情報",room_name_xxx);
    console.log('全コネクション数', socket.client.conn.server.clientsCount);

    // ルーム内にだれもいない時以外
    let a = socket.adapter.rooms.get(room_name);
    if (a != null) {
      same_room_id_list = Array.from(a);
      same_room_name_list = [];
      for (let i = 0; i < same_room_id_list.length; i++) {
        same_room_name = room_list[same_room_id_list[i]][0];
        same_room_name_list.push(same_room_name);
      }
      io.to(room_name).emit('update usernum', same_room_name_list);
    }
    io.emit('user disconnect', socket.client.conn.server.clientsCount);
  });

});

/**
 * 3000番でサーバを起動する
 */
// http.listen(3000, ()=>{
//   console.log("listening on *:3000");
// });
http.listen(PORT, () =>{
  console.log(`Listening on ${ PORT }`)
});