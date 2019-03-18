import {Component, OnDestroy} from '@angular/core';
import {UserService} from '../../services/user.service';
import {DataService} from '../../services/data.service';

@Component({
    selector:'app-home',
    styleUrls:['./home.component.css'],
    template:`        
       <div *ngIf="logged">
           <div *ngIf="feed" class="d-flex flex-column align-items-center">
               
               <div class="feed-container">

                   <div *ngFor="let f of feed let i = index" class="mt-5 mb-5 post-div">
                       <app-display-post [author]="f.author"
                                         [post]="f.post"
                                         [comments]="f.comments"
                                         (comment)="onComment($event,i)"
                                         (like)="onLike($event,i)"
                                         [styles]="{width: '100%',maxWidth: '600px',height:'350px'}"
                                         [styles2]="{flex:'0 1 130px'}"
                       ></app-display-post>
                   </div>
                   
               </div>
           </div>
       </div>
       
        <div *ngIf="!logged">
            <app-login></app-login>
        </div>
        
    `
})

export class HomeComponent implements OnDestroy{
    logged;
    feed;
    sub1;
    sub2;

    constructor(private userService:UserService,private data:DataService){
        this.data.newComment.subscribe(comment=>{
            comment=JSON.parse(comment);
            console.log(comment);
            let f=this.feed.find(f=>f.post.id==comment.postId);
            console.log(f);
            f.comments.push(comment);
        });

        this.logged=!!this.userService.getloggedUser();
        this.sub1=userService.getLogUserObservable().subscribe(user=>{this.logged=user});
        this.sub2=this.data.feed.subscribe(feed=>{console.log(this.feed);this.feed=feed});
        let user=this.userService.getloggedUser();
        if(user)
            this.data.getFeed(user);
    }

    onComment(inp,i){
        if(this.userService.getloggedUser()){
            let text=inp.value;
            this.data.addComment(this.feed[i].post.id,text,this.feed[i].author.id);

            inp.value='';
        }else {
            //route to login
        }
    }

    onLike(id,i){
        this.data.setLike(id,this.feed[i].author.id);
        if (!this.feed[i].post.likedByUser) {
            this.feed[i].post.likedByUser=true;
            this.feed[i].post.likes=Number(this.feed[i].post.likes)+1;
        }else {
            this.feed[i].post.likedByUser=false;
            this.feed[i].post.likes=Number(this.feed[i].post.likes)-1;
        }
    }


    ngOnDestroy(){
        this.sub1.unsubscribe();
        this.sub2.unsubscribe();
    }
}