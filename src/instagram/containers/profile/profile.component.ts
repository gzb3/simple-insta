import {Component, ElementRef, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';
import {User} from '../../models/user.model';
import {Post} from '../../models/post.model';
import {UserService} from '../../services/user.service';

@Component({
    selector: 'app-profile',
    styleUrls: ['./profile.component.css'],
    template:`        
        <div class="container mt-5">

            <div class="d-flex justify-content-center"><h2>{{error}}</h2></div>
            
                   <div class="d-flex justify-content-center">
                       
                       <div class="c">

                           <div class="d-flex flex-column mb-5" *ngIf="user" >

                               <div class="d-flex uinfo container">
                                   <div class="avatarDiv">
                                       <img class="avatar" src="{{user.image}}">
                                   </div>

                                   <div class="">
                                       <div class="p-2">
                                           <span class="big-text">{{user?.username}}</span>
                                           <button *ngIf="username!==loggedUsername&&!user.followedByUser" type="button" class="btn btn-primary btn-sm mb-3 pl-3 pr-3" (click)="follow(user.id)"  >Follow</button>
                                           <button *ngIf="username!==loggedUsername&&user.followedByUser" type="button" class="btn btn-outline-secondary btn-sm mb-3 pl-3 pr-3" (click)="follow(user.id)"  >Unfollow</button>
                                           <a *ngIf="username===loggedUsername" routerLink="/accounts/edit"  type="button" class="btn btn btn-default bg-white  btn-sm mb-3 pl-3 pr-3">Edit Profile</a>

                                       </div>

                                       <div class="d-flex flex-row p-2" >
                                           <span class="pff" >{{user?.posts}} posts</span>
                                           <!--<span class="pff">{{user?.followers}} followers</span> -->
                                           <a routerLink="followers" class="pff text-dark" (click)="showFollowing=true">followers: {{user?.followers}}</a>
                                           <a routerLink="following" class="pff text-dark" (click)="showFollowing=true">following: {{user?.following}}</a>
                                       </div>
                                       <div class="p-2">
                                           <span >{{user.fullName}}</span>
                                           <p class="bio">{{user.bio}}</p>
                                       </div>

                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>
            
            <div *ngIf="posts">
                <app-post-list [posts]="posts"></app-post-list>
            </div>
            
                <router-outlet></router-outlet>
             
        </div>

    `
})
export class ProfileComponent implements OnDestroy {
    showFollowing=false;
    loggedUsername;
    username;
    user:User;
    posts:Post[];
    error;_sub;_newPostSub;_sub2;_sub3;

    constructor(private _eref: ElementRef,private route:ActivatedRoute,private data:DataService,private userService:UserService) {
        route.params.subscribe(params=>{
            this.username=params['username'];
            this.data.getProfile(this.username);
            this._sub3=this.data.profileInfo.subscribe(user=>{this.user=user;});
            this._sub=this.data.profile.subscribe(res=>{
                let profile=JSON.parse(res);this.user=profile.user;
                this.posts=profile.posts;
                //get thumbnails instead of large images
                this.posts.forEach(post=>post.content=post.content.replace("posts/","thumbnails/"));
            });
            this._newPostSub =this.data.newPost.subscribe(post=>{post=JSON.parse(post);post.content=post.content.replace("posts/","thumbnails/");this.posts.unshift(post)});
            this._sub2=  this.data.error.subscribe(err=>this.error=err)
        });
        if(this.userService.getloggedUser())
            this.loggedUsername=userService.getloggedUser().username
    }


    ngOnDestroy(){
        this._sub.unsubscribe();
        this._sub2.unsubscribe();
        this._sub3.unsubscribe();
        this._newPostSub.unsubscribe();
    }

    follow(followId){
        this.data.follow(followId);
    }




}
