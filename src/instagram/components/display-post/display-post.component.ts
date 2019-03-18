import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChange, SimpleChanges} from '@angular/core';

@Component({
    selector:'app-display-post',
    styleUrls:['display-post.component.css'],
    template:`
        <div class=" justify-content-center d-flex " *ngIf="post">
            <article class="d-flex mt-3 post-art justify-content-center"  >
             
                <div class="contentDiv d-flex align-items-center ">
                              <img  src="{{post.content}}"  class="postImg" />
                </div>
                
                <aside class="comments-sidebar" [ngStyle]="styles" >
                    
                                        <div class="m-1 pl-2 d-flex flex-row author-info ">
                                        <div> <img src="{{author.image}}" class="smallAvatar"/> </div>
                                        <div class="mt-2"><span ><b class="pr-2"><a routerLink="/{{author?.username}}" class="text-dark">{{author?.username}}</a></b></span>
                                        </div>
                                    </div>
                    
                    <hr class="m-1 ">
                                        <div class="pl-3 pr-3 d-flex flex-column h-100">
                                                                  <div class="comments" [ngStyle]="styles2"  >
                                                                                    <p *ngIf="post.caption" class="small" ><a routerLink="/{{post.author?.username}}" class=" text-dark mr-1"><b>{{author.username}}</b>  </a> <span [innerHtml]="post.caption | linkify"></span></p>
                                                                              <ul class="p-0">
                                                                                  <li *ngFor="let comment of comments" >
                                                                                              <p class="m-0 small" >    <a routerLink="/{{comment.authorUsername}}" class=" text-dark mr-1">  <b>{{comment.authorUsername }}</b>   </a> <span [innerHtml]="comment.comment | linkify"></span> </p> 
                                                                                  </li>
                                                                              </ul>
                                                                  </div>
                                                                  <div class="postInfo">
                                                                            <section>
                                                                                    <hr class="m-0 p-0">
                                                                                    <span>
                                                                                        <button *ngIf="post?.likedByUser!==true" class="btn pt-0 pb-0 btn-link" type="button" (click)="setLike(post.id)" ><img class="icon" src="assets/like.png"/></button>
                                                                                        <button *ngIf="post.likedByUser" class="btn pt-0 pb-0 btn-link" type="button" (click)="setLike(post.id)" ><img class="icon" src="assets/like-pink.png"/></button>
                                                                                    </span>
                                                                                    <span><button type="button" class="btn pt-0 pb-0 btn-link"><img class="icon" src="assets/comment.png"/></button></span>
                                                                            </section>
                                                                            
                                                                            <div> <span class="pl-3">{{post.likes}} likes</span></div>
                                                                            <div><span class="pl-3 text-secondary"><small>{{post.date | date:'medium'}}</small></span></div>
                                                                            <hr class="m-0 p-0">
                                                                            <section>
                                                                                <input #inp type="text" placeholder="  Add a comment..."  (keyup.enter)="addComment(inp)" class="form-control border-0 m-0 p-0">
                                                                            </section>
                                                                  </div>
                                            
                                    </div>
                    
                </aside>
                
                
                
            </article>
        </div>
    `
})

export class DisplayPostComponent implements OnChanges{
    @Input() post;
    @Input() comments;
    @Input() author;
    @Output() like= new EventEmitter<any>();
    @Output() comment= new EventEmitter<any>();

    @Input () styles:any={};
    @Input () styles2:any={};

    constructor(){}

    setLike(id){
        this.like.emit(id);
    }
    addComment(inp){
        this.comment.emit(inp);
    }

    ngOnChanges(changes:SimpleChanges){
        if(changes.comments)
        this.comments=(changes.comments.currentValue);
    }
}
