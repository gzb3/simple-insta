import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {UserService} from './user.service';
import {Router} from '@angular/router';

@Injectable()
export class DataService {

    posts=this.socket.fromEvent<any[]>('posts');
    profile=this.socket.fromEvent<any>('profile');
    error=this.socket.fromEvent<any>('err');
    newPost=this.socket.fromEvent<any>('newPost');
    post=this.socket.fromEvent<any>('post');
    newComment=this.socket.fromEvent<any>('newComment');
    comments=this.socket.fromEvent<any>('comments');
    profileInfo=this.socket.fromEvent<any>('profileInfo');
    searchUsersResult=this.socket.fromEvent<any>('searchUsersResult');
    searchTagsResult=this.socket.fromEvent<any>('searchTagsResult');
    following=this.socket.fromEvent<any>('following');
    feed=this.socket.fromEvent('feed');
    loggedUserId;


    constructor(private socket:Socket,private userService:UserService,private router:Router) {

    }
    getLoggedUserId(){
        if (this.userService.getloggedUser())
            this.loggedUserId=this.userService.getloggedUser().id
    }

    setLike(postId,postAuthorId){
            let liker=this.userService.getloggedUser();
           liker ? this.socket.emit('setLike',{postId:postId,likerId:liker.id,likerUsername:liker.username,authorId:postAuthorId}) : this.router.navigate(['/login']);
    }

    addComment(postId,text,authorId){
        let commenter=this.userService.getloggedUser();
        commenter ? this.socket.emit('addComment',{postId:postId,text:text,commenterId:commenter.id,commenterUsername:commenter.username,authorId:authorId}) : this.router.navigate(['/login']);
    }

    getComments(postId){
        this.socket.emit('getComments',postId);
    }

    markNotification(n){
        let notification=n.notification;
        let user=this.userService.getloggedUser();
        this.socket.emit('markNotification',{id:notification.id,userId:user.id,postId:notification.postId});
    }

    getPost(fetcher,id){ ///if user is logged in send its id to determine if he already liked post that he is requesting
        if(fetcher) this.socket.emit('getPost',{fetcherId:fetcher.id,id:id});
        else this.socket.emit('getPost',{fetcherId:null,id:id});
    }

    follow(followId){
        this.getLoggedUserId();
        this.loggedUserId ? this.socket.emit('follow',{userId:this.loggedUserId,userUsername:this.userService.getloggedUser().username, followId:followId}) : this.router.navigate(['/login']);
    }

    addPost(uId,caption,imageName,buffer){
        this.socket.emit('addPost',{userId:uId,name:imageName,caption:caption},buffer);
    }

    getProfile(username) {//user+posts
        this.getLoggedUserId();
        this.socket.emit('getProfile',{username:username,loggedUserId:this.loggedUserId||''})
    }

    search(term){
        if(term.charAt(0)=='#'){
            //search for hashtags
            this.socket.emit('searchTags',term);
        }else{
            //search for users
            this.socket.emit('searchUsers',term);
        }
    }

    getTagPosts(hashtag){
        this.socket.emit('fetchTagPosts',hashtag)
    }

    getFeed(user){
        this.socket.emit('getFeed',user.id);
    }

    fetchFollowing(uname){
        this.socket.emit('fetchFollowing',uname);
    }

    leaveRoom(id){
        this.socket.emit('leaveRoom',id);
    }


}
