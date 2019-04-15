const app = require('express')();
const fs=require('fs');
const http=require('http').Server(app);
const db=require('./db.js');
const sharp = require('sharp');
const io=require('socket.io')(http);
//stores userId-socketId pairs
let userSockets={};
function checkIfSocketsInSameRoom(roomName,socket1Id,socket2Id,f){
    io.of('/').in(roomName).clients((error, clients) => {if (error) throw error;
        f((clients.includes(socket1Id)&&clients.includes(socket2Id)))
    });

}
function joinRoom(postId,socket){
    //leave previous room
    if (socket.lastRoom) {
        socket.leave(socket.lastRoom, function (err) {
            socket.lastRoom = null;
        });
    }
    let roomName=postId.toString();
        socket.join(roomName,function () {
            socket.lastRoom=roomName;
        });
}
function emitNotifications(notifications,socket) {
    if(notifications) {
        let parsed=JSON.parse(notifications);
        if(parsed.length>0) socket.emit('alert', 'notifications');
        else socket.emit('alert','');
        socket.emit('notifications', notifications);
    }
    else{
        socket.emit('err','Unable to fetch notifications');
    }
};

io.on("connection", socket => {
    socket.on('loggedUser',user=>{
        userSockets[user.id.toString()]=socket.id;
        //check if there are unread notifications
        db.fetchNotifications(user.id,function (notifications) {
            notifications=JSON.parse(notifications);
            if(notifications.length>0) socket.emit('alert', 'notifications');
            else socket.emit('alert','');
        });
    });
    socket.on("login",user=>{
        db.login(user.username,user.password,function (u) {
            if(u){//user exists
                db.fetchNotifications(u.id,function (notifications) {
                    notifications=JSON.parse(notifications);
                    if(notifications.length>0) socket.emit('alert', 'notifications');
                    else socket.emit('alert','');

                    socket.emit('user',u);
                });

                userSockets[u.id.toString()]=socket.id;
            }else //user does not exist
                socket.emit('err','Wrong Username Or Password')
        });
    });
    socket.on("logout",user=>{});
    socket.on('signup',user=>{
        db.signup(user,function(res){
            if(res){
                socket.emit('user',res);
                userSockets[res.id.toString()]=socket.id;
            }else {
                socket.emit('err','Username already taken');
            }
        })

    });
    socket.on('getPost',data=>{
        db.getPost(data.fetcherId,data.id,function (post) {
            if(post){
                let postId=JSON.parse(post).id;
                socket.emit('post',post);
                joinRoom(postId,socket);
            }
            else socket.emit('err','This Post Does Not Exist')
        })
    });
    socket.on('getComments',postId=>{
        db.getComments(postId,function (comments) {
                socket.emit('comments', comments)
        })
    });
    socket.on('addPost', (data, buffer)=> {
        let userId=data.userId;
        let imgName=data.name.toString();
        let ext=imgName.match(/.jpg|.jpeg|.png/);
        if(ext)ext=ext[0];
        let newName=Math.random().toString(36).substr(2, 10)+ext;
        let image= 'posts/'+newName;
        if(ext){
            db.addPost(userId,image,data.caption,function (res) {
                let filename='../instagram/posts/'+newName;
                fs.open(filename,'a',function (err, fd) {
                    if(err) throw err;
                    fs.write(fd,buffer,null,'Binary',function (err, written, buff) {
                        fs.close(fd,function () {
                            console.log('file uploaded');
                            //create thumbnail
                            let source=filename;
                            let dest='../instagram/thumbnails/'+newName;
                            sharp(source)
                                .resize(270,270,{fit:"cover"})
                                .toBuffer()
                                .then( d => {
                                    fs.writeFileSync(dest, d);
                                    socket.emit('newPost',res);
                                })
                                .catch( err => {console.log(err);});
                        })
                    })
                });
            });
        }else {
            socket.emit('err','Wrong file type')
        }
    });
    socket.on('addComment',data=>{//{postId:postId,text:text,commenterId:commenter.id,commenterUsername:commenter.username,authorId:authorId}
        if(socket.lastRoom!=data.postId) joinRoom(data.postId,socket);
        db.addComment(data,function (res,postId,notificationId) {//roomName, socket1ID , socket2ID
            io.sockets.in(data.postId.toString()).emit('newComment',res);
            checkIfSocketsInSameRoom(postId.toString(),socket.id,userSockets[data.authorId.toString()],function (result) {
                if(result)
                    db.markNotification({id:notificationId},function (res) {});
                else
                    io.to(userSockets[data.authorId.toString()]).emit('alert','comment');
            });
        });
    });
    socket.on('leaveRoom',id=>{
        socket.leave(id.toString(), function (err) {
            socket.lastRoom=null;
        });


    });
    socket.on("setLike",data=>{ //{postId:postId,likerId:liker.id,likerUsername:liker.username,authorId:postAuthorId}
        db.setLike(data ,function (res) {//get liked user socket id
            //if users are in the same room, there is no need for notification
            checkIfSocketsInSameRoom(data.postId,socket.id,userSockets[data.authorId.toString()],function (result) {
                if(result){
                    if(res)
                    db.markNotification({id:res.insertId},function (r) {})
                }else
                    io.to(userSockets[data.authorId.toString()]).emit('alert','like');
            })
        })
    });
    socket.on("getProfile",data=>{
        db.getProfile(data,function (res) {
            if(res) socket.emit('profile',res);
            else  socket.emit('err','This Page Does Not Exist')
        })
    });
    socket.on("getNotifications",userId=>{
        db.fetchNotifications(userId,function (notifications) {
            emitNotifications(notifications,socket);
        })
    });
    socket.on("markNotification",data=>{//id, userId
       db.markNotification(data,function (res) {
           db.fetchNotifications(data.userId,function (notifications) {
               emitNotifications(notifications,socket);
           })
       })
    });
    socket.on('follow',data=>{
        db.follow(data,function (followedUser) {
            //emit follow notification to followed user socket
            io.to(userSockets[data.followId.toString()]).emit('alert','follow');
            socket.emit('profileInfo',followedUser);
        })
    });
    socket.on('searchUsers',term=>{
        db.searchUsers(term,function (usersArray) {
          socket.emit('searchUsersResult',usersArray)
        });
    });
    socket.on('searchTags',term=>{
        db.searchTags(term,function(tagsArray){
            socket.emit('searchTagsResult',tagsArray)
        })
    });
    socket.on('fetchTagPosts',hashtag=>{
        db.fetchTagPosts(hashtag,function(posts){
            socket.emit('posts',posts);
        })
    });
    socket.on('getFeed',userId=>{
       db.getFeed(userId,function (feed) {
           socket.emit('feed',feed);
       })
    });
    socket.on('edit',data=>{//user,fileName,buffer
        db.edit(data,function (res) {
            if(data.fileName){
                let filename='../instagram/thumbnails/'+data.fileName;
                fs.open(filename,'a',function (err, fd) {
                    if (err) throw err;
                    fs.write(fd,data.buffer,null,'Binary',function (err, written, buff) {
                        fs.close(fd,function () {
                            sharp(filename)
                                .resize( 230,230,{fit:"cover"})
                                .toBuffer()
                                .then( d => { fs.writeFileSync(filename, d);
                                    db.changeProfilePicture(data.user.id,'thumbnails/'+data.fileName,function (u) {
                                        socket.emit('user',u);
                                    });
                                })
                                .catch( err => {console.log(err);});
                        })
                    })
                })
            }else{
                socket.emit('user',res);
            }
        })
    });
    socket.on('changePassword',data=>{//user,newPassword
        db.changePassword(data,function (res) {
            socket.emit('user',res);
        })
    })
    socket.on('fetchFollowing',uname=>{
        db.fetchFollowing(uname,function (res) {
            socket.emit('following',res)
        })
    });
    socket.on('fetchFollowers',uname=>{
        db.fetchFollowers(uname,function(res){
            socket.emit('followers',res)
        })
    })
});
http.listen(4444);
console.log('Server Listening on 4444');
