import {Component, Input, OnDestroy} from '@angular/core';
import {UserService} from '../../services/user.service';
import {Notification} from '../../models/notification.model';
import {DataService} from '../../services/data.service';
import {ActivatedRoute, ActivatedRouteSnapshot, Router} from '@angular/router';

@Component({
    selector:'app-notification',
    styleUrls:['./notification.component.css'],
    template:`        
        <div class="notif-div ">
            
            <div *ngIf="notifications && !notifications.length" class="d-flex flex-column">
                 <div class="d-flex justify-content-center m-3"><span>Activity On Your Posts</span></div>
                    <div class="d-flex justify-content-center m-3"><span>When someone likes or comments on one of your posts, you'll see it here.</span></div>
            </div>
            
            <ul class="">
                <li  *ngFor="let notification of notifications" class="">
                    <div>
                        <a (click)="markAsRead(notification)" class="text-dark" routerLink="">
                            <div class="d-flex justify-content-between pl-2 pr-2 ">
                                
                                <div class="d-flex">
                                    <div class="mr-3">
                                        <img src="{{notification.senderImg}}" class="avatar"/>
                                    </div>
                                    <div>
                                        <span>{{notification.notification.text}}</span>
                                    </div>
                                </div>
                                
                               
                                
                                <div>
                                        <img *ngIf="notification.postThumb!=''" src="{{notification.postThumb}}" class="small"/>
                                    
                                </div>
                                
                            </div>
                            
                        </a>
                    </div>
                </li>
            </ul>
        </div>
    `
})

export class NotificationComponent implements OnDestroy{
    user;
    notifications:any;
    _sub;
    constructor(private userService:UserService,private data:DataService,private router:Router){
        this.user=userService.getloggedUser();
        this.userService.getNotifications(this.user.id);
        this._sub=this.userService.notifications.subscribe(n=>{
           this.notifications=JSON.parse(n);
       });
    }
    ngOnDestroy(){
        this._sub.unsubscribe();
    }

    markAsRead(notification){
        this.data.markNotification(notification);
        this.router.navigateByUrl(notification.notification.href);
    }

}





















