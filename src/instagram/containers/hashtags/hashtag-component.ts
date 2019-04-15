import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DataService} from '../../services/data.service';

@Component({
    selector:'app-hashtag'
    ,styleUrls:['hashtag.component.css'],
    template:`
        <div>
            <div class="d-flex justify-content-center mt-5">
                <h2 >#{{hashtag}}</h2>
            </div>
            
            <div class="mt-4">
                <app-post-list *ngIf="posts" [posts]="posts"></app-post-list>    
            </div>
            <div *ngIf="posts==[] " class="d-flex justify-content-center"><h4>Sorry, this page isn't available.</h4></div>
        </div>
        
    `
})

export class HashtagComponent {
    hashtag;
    posts;
    constructor(private route:ActivatedRoute,private data:DataService){
        this.route.params.subscribe(params=>{
            this.hashtag=params['hashtag'];
            this.data.getTagPosts(this.hashtag);
            this.data.posts.subscribe(posts=>{this.posts=posts;this.posts.forEach(post=>post.content=post.content.replace("posts/","thumbnails/"));});
        })

    }


}