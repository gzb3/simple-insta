import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {Post} from '../../models/post.model';
import {ActivatedRoute, Router} from '@angular/router';
import { Location } from '@angular/common';

@Component({
    selector: 'app-post-list',
    styleUrls: ['./post-list.component.css'],
    template:`        
        <article class="wrapper" >
            <div *ngFor="let post of posts" class="smallImgDiv "  >
                <a  class="thumb-link position-relative" (click)="showPost(post)">
                    <span class="like-span"><img src="./assets/grey-heart.png"/> {{post.likes}}</span>
                    <span class="com-span"><img src="./assets/speech-bubble.png"/>  {{post.comments}} </span>
                    <img src="{{post?.content}}" class="thumb-img"  />
                </a>
            </div>
        </article>
        
        <div class="customModal" id="modal" (click)="returnToProfile($event)" *ngIf="postModal">
            <button (click)="changePost('l')" class=" arrowButton font-weight-bold btn-lg ">❮</button>
                 <div >
                        <app-post *ngIf="postModal && this.currentPost" [id]="currentPost.id"></app-post>
                 </div>
            <button (click)="changePost('r')" class="border-0 arrowButton  font-weight-bold btn-lg">❯</button>
        </div>
    `
})
export class PostListComponent implements OnInit,OnChanges,OnDestroy {

    currentPost;
    postModal=false;
    profileUrl;
    @Input() posts:Post[];
    constructor(private router:Router,private location: Location,private route:ActivatedRoute) {
        route.url.subscribe(u=>{this.profileUrl='/'+u[0].path;this.postModal=false});
    }
    toggleModal=()=>{this.postModal=!this.postModal;};

    returnToProfile(event){
        if(event.target.id=='modal'){
            this.location.go(this.profileUrl);
            this.toggleModal();
            this.currentPost=null;
            console.log(this.currentPost);
            document.body.style.overflow = "auto";
        }
    }

    ngOnInit() {
    }
    showPost(post){
        this.location.go('/p/'+post.id);
        this.currentPost=post;
        this.toggleModal();
        document.body.style.overflow = "hidden";
    }

    ngOnChanges(){
        this.currentPost=null;
    }
    ngOnDestroy(){
    }
    changePost(s){//if left arrow is clicked change current post to one before inside posts array
        let index=this.posts.findIndex(p=>this.currentPost.id==p.id);
        if(s=='l'&&index>0){
            this.location.go('/p/'+this.posts[index-1].id);
            this.currentPost=this.posts[index-1];
        }
        else if(s=='r'&& index<this.posts.length-1){
            this.location.go('/p/'+this.posts[index+1].id);
            this.currentPost=this.posts[index+1];
        }
    }


}
