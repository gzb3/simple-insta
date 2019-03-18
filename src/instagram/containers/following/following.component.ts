import {Component, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../services/user.service';

@Component({
    selector:'instagram-following',
    styleUrls:['following.component.css'],
    template:`
        <div class="customModal">
            <div class="foll-div">
                <div class="p-2">
                    <a routerLink="../" class="text-dark mr-2 mt-1 position-relative close " >X</a>

                    <div class="d-flex justify-content-center">
                        <h4 class="">Following </h4>    
                    </div>
                    
                </div>
                
                <div>
                    <ul class="list-group">

                        <li class="list-group-item" *ngFor="let user of followingUsers">
                            <div class="d-flex">
                                <div>
                                    <img src="{{user.image}}" class="smallAvatar"/>
                                </div>

                                <div>
                                    <a routerLink="{{'/'+user.username}}" class="text-dark font-weight-bold">{{user.username}}</a>
                                </div>

                            </div>

                        </li>

                    </ul>


                </div>
                
            </div>
            
        </div>
       
    `
})

export class FollowingComponent implements OnDestroy{

    followingUsers;
_sub;

    constructor(private data:DataService,private route:ActivatedRoute,private router: Router,private userService:UserService){
     this._sub=   this.data.following.subscribe(users=>this.followingUsers=users);
            this.data.fetchFollowing(this.router.url.split("/")[1])




    }


    ngOnDestroy(){
        this._sub.unsubscribe();
    }





}