import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {Post} from '../../models/post.model';
import {UserService} from '../../services/user.service';
import {Comment}from '../../models/comment.model';

@Component({
    selector:'app-post',
    styleUrls:['post.component.css'],
    template:
    `
        <app-display-post [post]="post" 
                          [comments]="comments"
                          [author]="post?.author"
                          [error]="error"
                          (comment)="onComment($event)"
                          (like)="onLike($event)"
        ></app-display-post>
    `
})

export class PostComponent implements OnDestroy,OnInit,OnChanges{
    comments:Comment[]=[];
    error;
    postId;
    _sub;_sub2;_sub3;
    post:Post;
    @Input() id; //postId if we are running from profile component
    constructor(private route:ActivatedRoute,private data:DataService,private userService:UserService) {
        this._sub2=this.data.newComment.subscribe(comment=>{this.comments.push(JSON.parse(comment));this.comments=this.comments.slice();console.log(this.comments)});
        this._sub=this.data.post.subscribe(post=>{this.post=JSON.parse(post)});
        this._sub3=this.data.comments.subscribe(comments=>{this.comments=comments});
        this.data.error.subscribe(err=>this.error=err);
    }
    ngOnInit(){
        this.route.params.subscribe(param=>{
            this.postId=param['id'];
            if(!this.postId) this.postId=this.id;
            if(this.postId){//fetch Post and comments
                this.data.getPost(this.userService.getloggedUser(),this.postId);
                this.data.getComments(this.postId);
            }
        })
    }
    ngOnChanges(changes:SimpleChanges){
        if(!changes['id'].isFirstChange()) {
            this.postId=changes.id.currentValue;
            this.data.getPost(this.userService.getloggedUser(),this.postId);
            this.data.getComments(this.postId);
        }
    }
    onComment(inp){
        if(this.userService.getloggedUser()){
            let text=inp.value;
            this.data.addComment(this.postId,text,this.post.author.id);
            inp.value='';
        }else {
            //route to login
        }
    }
    onLike(id){
        this.data.setLike(id,this.post.author.id);
        if (!this.post.likedByUser) {
            this.post.likedByUser=true;
            this.post.likes=Number(this.post.likes)+1;
        }else {
            this.post.likedByUser=false;
            this.post.likes=Number(this.post.likes)-1;
        }
    }
    ngOnDestroy(){
        this._sub.unsubscribe();
        this._sub2.unsubscribe();
        this._sub3.unsubscribe();
        this.data.leaveRoom(this.postId);
        this.id=null;
     }
}