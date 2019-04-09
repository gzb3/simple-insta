import {Component, OnDestroy} from '@angular/core';
import {DataService} from '../../services/data.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector:'instagram-followers',
    styleUrls:['followers.component.css'],
    template:`
        <div class="customModal">
            <div class="foll-div">
                <div class="p-2">
                    <a routerLink="../" class="text-dark mr-2 mt-1 position-relative close " >X</a>

                    <div class="d-flex justify-content-center">
                        <h4 class="">Followers </h4>    
                    </div>
                    
                </div>
                
                <div>
                    <ul class="list-group">

                        <li class="list-group-item" *ngFor="let user of followers">
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

export class FollowersComponent implements OnDestroy{

    followers;
    _sub;

    constructor(private data:DataService,private route:ActivatedRoute,private router: Router){
        this._sub=   this.data.followers.subscribe(users=>this.followers=users);
        this.data.fetchFollowers(this.router.url.split("/")[1])
    }

    ngOnDestroy(){
        this._sub.unsubscribe();
    }


}