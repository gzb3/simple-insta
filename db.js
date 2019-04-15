let mysql=require('mysql');
function getConnection(){
    return mysql.createConnection({host:"localhost", user:"root", password:"password", database:"instagram"});
}
let con=getConnection();
function queryDB(query,callb){
         return con.query(query,function (err, result, fields) {
             if (err) throw err;
             if(!result) callb(undefined);
             else callb(result);
         })
 }
function insertNotification(senderId, recipientId,postId,text,href, callb) {
            if(senderId!==recipientId){
                let sql=`INSERT INTO notifications (senderId,recipientId,postId,text,href) VALUES (?,?,?,?,?)`;
                con.query(sql,[senderId ,recipientId,postId,text,href],function (err, result, fields) {
                    if (err) throw err;
                    callb(result)
                })
            }
            else
                callb(undefined);
 }
function getUser(id,fn) {
        con.query(`SELECT * FROM users WHERE id='${id}'`,function (err, result, fields) {
            if(err) throw err;
            fn(result);
        })
}
function checkIfFetcherLikedPost(post,fetcherId,fn) {
    //check if fetcher already liked post
    if(fetcherId){
        queryDB(`SELECT * FROM likes WHERE postId=${post.id} AND userId=${fetcherId}`,function (result) {
            if(result.length>0) {
                post.likedByUser=true;
                fn(JSON.stringify(post))
                //fn({post:post,author:author})
            }else{
                fn(JSON.stringify(post));}
        });
    }
    else{
        fn(JSON.stringify(post));}
}
function getPost(fetcherId,id,fn){
    queryDB(`SELECT * FROM posts WHERE id='${id}'`,function (result) {
        let post=result[0];
        if(post){
            getUser(post.userId,function (user) {  //get author of post
                post.author=user[0];
                checkIfFetcherLikedPost(post,fetcherId,fn);
            });
        }else fn(null);

    })
}
function getComments(postId,fn){
    queryDB(`SELECT * FROM comments WHERE postId=${postId}`,function (result) {
        fn(result);
    });
}
function getThumbnail(postId,fn){
    if(postId){
        queryDB(`SELECT * FROM posts WHERE id=${postId}`,function (post) {
            let img=post[0].content;
            let thumb="thumbnails/"+img.split("/")[1];
            fn(thumb)
        })
    }else
        fn('');
}

module.exports.fetchNotifications=function (userId,fn){
    let result=[];
    queryDB(`SELECT * FROM notifications WHERE recipientId=${userId} AND r=0`,function(notifications){
        //get sender image and post img (if it exists)
        if(notifications.length){
            notifications.forEach((n,i)=>{
                getUser(n.senderId,function (u) {
                    getThumbnail(n.postId,function (thumb) {
                        result.push({senderImg:u[0].image,notification:n,postThumb:thumb});
                        if(i===notifications.length-1){
                            fn(JSON.stringify(result));
                        }
                    })
                })
            });
        }else fn(JSON.stringify([]));
    })
};
module.exports.markNotification=function (data,fn){
    //`UPDATE notifications SET r=1 WHERE postId=${data.postId}` OR
    if(data.id)
        queryDB(`UPDATE notifications SET r=1 WHERE id=${data.id}`,function (res) {fn(res)})
};
module.exports.getPost=function (fetcherId,id,fn){
    getPost(fetcherId,id,fn);
};
module.exports.setLike=function (data,fn){
    // inserts like into database then inserts notification for post author
    ///delete and if affected rows is 0, then insert
    queryDB(`DELETE FROM likes WHERE postId=${data.postId} AND userId=${data.likerId}`,function (result) {
        if (result.affectedRows===0){//if like does not exist insert it
            let sql=`INSERT INTO likes (postId, userId, authorId) VALUES (?,?,?)`;
            con.query(sql,[data.postId ,data.likerId,data.authorId],function (err, result, fields) {
                if (err) throw err;
                //after we set like we should increase number of likes on post in posts table
                queryDB(`UPDATE posts SET likes= likes+1 WHERE id=${data.postId}`,function (result) {});

                //insert notification about like for like receiver
                insertNotification(data.likerId,data.authorId,data.postId,`${data.likerUsername} liked your photo`,"/p/"+data.postId,function (res) {
                    fn(res);
                })
            })
        }else{
            //if we deleted like we should delete like notification also
            queryDB(`DELETE FROM notifications WHERE postId=${data.postId} AND senderId=${data.likerId} AND text LIKE '%{like}%'`,function (result) {});

            //also decrease number of likes of post in posts table
            queryDB(`UPDATE posts SET likes= likes-1 WHERE id=${data.postId}`,function (result) {});
        }
    });
};
module.exports.getComments=function (postId,fn){
    getComments(postId,fn)
};
module.exports.addComment=function (data,fn){
    //insert comment into comments table
    let sql=`INSERT INTO comments 
    (userId,postId,comment,authorUsername) VALUES
    (?,?,?,?)`;
    con.query(sql,[data.commenterId,data.postId,data.text,data.commenterUsername],function (err, result, fields) {
        if (err) throw err;
        //select and return new comment;
        queryDB(`SELECT * FROM comments where id=${result.insertId}`,function (result) {
            //insert notification about comment for receiver
            let shortText=data.text.substring(0,20);
            insertNotification(data.commenterId,data.authorId,data.postId,`${data.commenterUsername} commented your photo: ${shortText} `,"/p/"+data.postId,function (res) {
                if(res)
                    fn(JSON.stringify(result[0]),data.postId,res.insertId);
                else
                    fn(JSON.stringify(result[0]),data.postId,'');
            });
        });
        //increase comments number on post
        queryDB(`UPDATE posts SET comments= comments+1 WHERE id=${data.postId}`,function (result) {});
    })
};
module.exports.follow=function (data,fn){
    ///delete and if affected rows is 0 then isert
    queryDB(`DELETE from followers WHERE userId=${data.followId} AND followerId=${data.userId}`,function(result){
        if(result.affectedRows===0){//if is not already following start following
            let sql=`INSERT INTO followers (userId,followerId) VALUES (?,?)`;
            con.query(sql,[data.followId,data.userId],function (err, result, fields) {
                if(err) throw err;
                queryDB(`UPDATE users set followers=followers+1 WHERE id=${data.followId}`,function (result) {
                    queryDB(`UPDATE users set following=following+1 WHERE id=${data.userId}`,function (result) {
                        insertNotification(data.userId,data.followId,null,`${data.userUsername} started following you`,"/"+data.userUsername,function (result) {
                            queryDB(`SELECT * FROM users WHERE id=${data.followId}`,function (result) {
                                let user=result[0];
                                user.followedByUser=true;
                                fn(user);
                            })
                        })
                    });
                });
            })
        }else{///unfollow
            queryDB(`UPDATE users set followers=followers-1 WHERE id=${data.followId}`,function (result) {
                queryDB(`UPDATE users set following=following-1 WHERE id=${data.userId}`,function (result) {
                    //if unfollowed delete notification
                    queryDB(`DELETE FROM notifications WHERE postId IS NULL AND senderId=${data.userId} AND recipientId=${data.followId}`,function (res) {
                        queryDB(`SELECT *FROM users WHERE id=${data.followId}`,function (result) {
                            let user=result[0];
                            user.followedByUser=false;
                            fn(user)
                        })
                    });
                });
            });
        }
    })

};
module.exports.getProfile=function (data,fn){
        con.query(`SELECT*FROM users WHERE username='${data.username}'`,function (err, result, fields) {
            if (err) throw err;
            if (!result[0]){//user does not exist // console.log("result =[]");
                fn(undefined);
            } else{
                let user = result[0];
                con.query(`SELECT * FROM posts WHERE userId='${user.id}'`, function (err, posts, fields) {
                    if (err) throw err;
                    posts=posts.reverse();
                    if(data.loggedUserId!==''){
                        //check if user is being followed by logged In user
                        queryDB(`SELECT * FROM followers WHERE userId=${user.id} AND followerId=${data.loggedUserId}`,function (result) {
                            result.length>0 ? user.followedByUser=true : user.followedByUser=false;
                            let profile = {user: user, posts: posts};
                            fn(JSON.stringify(profile));
                        });
                    }else{
                        user.followedByUser=false;
                        let profile = {user: user, posts: posts};
                        fn(JSON.stringify(profile));
                    }
                })
            }
        })
};
module.exports.addPost=function(userId,image,caption,fn){
        let sql=`INSERT INTO posts (userId, content, caption) VALUES (?,?,?)`;
        con.query(sql,[userId,image,caption],function (err, result, fields) {if (err) throw err;
                queryDB(`UPDATE users SET posts=posts+1 WHERE id=${userId}`,function (r) {
                    con.query(`SELECT * FROM posts WHERE id='${result.insertId}'`,function (err, result, fields) {if(err) throw err;
                        //parse hashtags
                        let postId=result[0].id;
                        let hashtags=caption.split(" ").filter(word=>word.charAt(0)==='#'&&word.length>1);
                        let hashtagsql=`INSERT INTO hashtags (postId,hashtagName) VALUES ?`;
                        let values=[];

                        if(hashtags.length){
                            hashtags.forEach(hashtag=>{ values.push([postId,hashtag.substring(1)]);  });
                            con.query(hashtagsql,[values],function (err) {if(err) throw err;
                                fn(JSON.stringify(result[0]));
                            });
                        }else
                            fn(JSON.stringify(result[0]));

                    })
                });
        })
};
module.exports.searchUsers=function(term,fn){
    queryDB(`SELECT * FROM users WHERE username LIKE '%${term}%'`,function (result) {
        fn(result);
    })
};
module.exports.searchTags=function(term,fn){
    term=term.substring(1);
    queryDB(`SELECT*FROM hashtags WHERE hashtagName LIKE '${term}%'`,function (result) {
        let counts={};
        result.forEach(hashtag=>{counts[hashtag.hashtagName] = (counts[hashtag.hashtagName] || 0 )+1; hashtag.number=counts[hashtag.hashtagName]});
        result=result.reverse();//count number of duplicate tags,store them in 'number' property, reverse array and remove duplicates
        result=result.filter((s => a => !s.has(a.hashtagName) && s.add(a.hashtagName))(new Set));
        fn(result);
    });

};
module.exports.fetchTagPosts=function(hashtag,fn){
  //select all postIds where tag=hashtag and put them in array
  //select * from posts where ids = postIds
    queryDB(`SELECT*FROM hashtags WHERE hashtagName='${hashtag}'`,function (result) {
            if(result.length>0){
                let postIds=[];
                result.forEach(h=>postIds.push(h.postId));
                let sql=`SELECT * FROM posts WHERE `;
                postIds.forEach(id=>sql+=`id=${id} OR `);
                sql=sql.slice(0, -3);
                queryDB(sql,function (posts) {
                    posts=posts.reverse();
                    fn(posts);
                })
            }
    })

};
module.exports.getFeed=function(id,fn){

    queryDB(`SELECT * FROM followers WHERE followerId=${id}`,function (res) {
        if(res.length>0){
            let users=[];
            res.forEach(f=>users.push(f.userId));
            let feedsql=`SELECT * FROM posts WHERE `;
            users.forEach(id=>feedsql+=`userId= ${id} OR `);
            feedsql=feedsql.slice(0,-3);
            let feed=[];
            queryDB(feedsql,function (posts) {
                posts.forEach((p,i)=>{
                    getUser(p.userId,function (user) {
                        queryDB(`SELECT* FROM comments WHERE postId=${p.id}`,function (comments) {
                            checkIfFetcherLikedPost(p,id,function (post) {
                                feed[i]={post:JSON.parse(post),author:user[0],comments:comments};
                                if(i===feed.length-1) {
                                    feed.reverse();
                                    fn(feed);
                                }
                            });
                        });
                    })
                });
            })
        }else{
            fn('');
        }

    })

};
module.exports.login=function (username,password,fn) {
          con.query( `SELECT * FROM users WHERE username='${username}' AND password='${password}'`,function (err, result, fields) {
             if(err) throw err;
             if(!result.length){
                 fn(undefined)
             }else fn(result[0]);
         })
};
module.exports.signup=function (user, fn) {
    queryDB(`SELECT * FROM users WHERE username='${user.username}' `,function (res) {
        if(!res.length){//create user
            con.query(`INSERT INTO users (username,email,password) VALUES (?,?,?)`,[user.username,user.email,user.password],function (err, result, fields) {
                if(err) throw err;
                queryDB(`SELECT * FROM users where id='${result.insertId}'`,function (user) {
                   fn(user[0]);
                });
            });
        }else
            fn(undefined);
    })
};
module.exports.edit=function (data,fn) {
    con.query(`UPDATE users SET username='${data.user.username}', fullName='${data.user.fullName}',bio='${data.user.bio}', email='${data.user.email}' WHERE id='${data.user.id}'`,function (err,result,fields) {
        if (err) throw err;
        queryDB(`SELECT*FROM users WHERE id='${data.user.id}'`,function (u) {
            fn(u[0]);
        });
    });
};
module.exports.changePassword=function (data, fn) {
    con.query(`UPDATE users SET password='${data.newPassword}' WHERE id='${data.user.id}'`,function (err,result,fields) {
        if(err) throw err;
        queryDB(`SELECT*FROM users WHERE id='${data.user.id}'`,function (u) {
            fn(u[0]);
        });
    });

};
module.exports.changeProfilePicture=function (userId, image,fn) {
    con.query(`UPDATE users SET image='${image}' WHERE id='${userId}'`,function (err, result, fields) {
        if (err) throw err;
        queryDB(`SELECT*FROM users WHERE id='${userId}'`,function (u) {
            fn(u[0]);
        });
    })
};
module.exports.fetchFollowing=function (uname, fn) {
    queryDB(`SELECT * FROM users WHERE username='${uname}'`,function (user) {
        let id=user[0].id;
        queryDB(`SELECT * FROM followers WHERE followerId='${id}'`,function (res) {
            if(res.length){
                let followSql=`SELECT * FROM users WHERE `;
                res.forEach(u=>{
                    followSql+=`id='${u.userId}' OR `
                });
                followSql=followSql.slice(0,-3);
                queryDB(followSql,function (res) {
                    fn(res)
                })
            }else fn([]);
        })
    })
};
module.exports.fetchFollowers=function (uname, fn) {
    queryDB(`SELECT * FROM users WHERE username='${uname}'`,function (user) {
        let id=user[0].id;
        queryDB(`SELECT * FROM followers WHERE userId='${id}'`,function (res) {
            if(res.length){
                let followSql=`SELECT * FROM users WHERE `;
                res.forEach(u=>{
                    followSql+=`id='${u.followerId}' OR `
                });
                followSql=followSql.slice(0,-3);
                queryDB(followSql,function (res) {
                    fn(res)
                })
            }else fn([]);
        })
    })
};
