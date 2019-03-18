import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {UserService} from '../../services/user.service';
import {HttpClient} from '@angular/common/http';
import {Socket} from 'ngx-socket-io';
import {of} from 'rxjs';

@Component({
    host: {
        '(document:click)': 'onClick($event)',
    },
    selector: 'app-navigation',
    styleUrls: ['./navigation.component.css'],
    template:`        

        <nav class="navbar navbar-expand p-2 pt-3 navbar-light justify-content-center border-bottom" >
            
            <div class=" justify-content-center w-65" id="navbarSupportedContent"  >
                <ul  class="navbar-nav mr-auto d-flex w-100 flex-row justify-content-around" >
                    <li class="nav-item">
                        <a  routerLink="/" class="nav-link logo " > </a>
                    </li>
                    <form class="form-inline">
                       <input [(ngModel)]="val" name="s" autocomplete="off"  class="form-control input-sm input-search" type="search" placeholder="Search" aria-label="Search" (click)="onSearchChange($event.target.value)" (input)="onSearchChange($event.target.value)">
                        <div class="searchDiv position-relative " *ngIf="this.showSearchDiv">
                            <app-search-suggestions *ngIf="this.showSearchDiv&&this.searchValue.charAt(0)!=='#'&&this.searchValue!==''" [value]="this.searchValue"></app-search-suggestions>
                            <app-hashtag-search-suggestions *ngIf="this.showSearchDiv&&this.searchValue.charAt(0)==='#'&&this.searchValue!==''" [value]="this.searchValue" ></app-hashtag-search-suggestions>
                        </div>
                        
                    </form>
                    <li class="nav-item " >
                        
                        <div class="d-flex" *ngIf="!loggedUser?.id">
                            <a [routerLink]="['/login']" class="btn btn-primary ">Log In</a>
                            <a routerLink="/signup" class="nav-link ">Sign Up</a>
                        </div>
                        
                        <div class="d-flex mt-2" *ngIf="loggedUser?.id" >
                            <a routerLink="{{loggedUser?.username}}" class="mt-2" ><img src="./assets/profile.png"/></a>

                            <button *ngIf="this.alert==='' " style="height: 30px" (click)="showDiv()" class="btn btn-link" ><img style="width: 30px" src="./assets/like.png"/></button>
                            <button *ngIf="this.alert!=='' " style="height: 30px" (click)="showDiv()" class="btn btn-link" ><img style="width: 30px" src="./assets/notif-alert.png"/></button>

                            <input type="file" class="inputfile" name="file" accept="image/*" id="file" (change)="onFileSelected($event)">
                            <label for="file" class="nav-link mb-0" ><img src="assets/add.png"/></label>
                          
                            <button (click)="logOut()" class="btn btn-link" >Log Out</button>

                        </div>
                    </li>
                    
                </ul>
            </div>
        </nav>
        
        <div *ngIf="newPostDiv">
            <div class="customModal">
                <div class="w-50 h-50 mfDiv">
                            <div class="form-group">
                                <label for="caption" class=" capLab">Caption</label>
                                <textarea #c id="caption" class="form-control ta" rows="4" cols="200"></textarea>
                                <button  class="btn btn-secondary w-50" (click)="cancelPost()">Cancel</button>
                                <button  class="btn btn-primary w-50" (click)="addPost(c)">Post</button>
                            </div>
                </div>
            </div>
        </div>
        
        <div class="notificationsDiv" *ngIf="this.showNotifications"  >
            <app-notification ></app-notification>
        </div>
    `
})
export class NavigationComponent implements  OnDestroy {
    val;
    loggedUser;
    newPostDiv=false;
    file;
    alert='';
    showNotifications=false;
    showSearchDiv=false;
    searchValue='';
    _subUser;
    _subAlert;
    constructor(router:Router,private _eref: ElementRef, private socket:Socket, private route:ActivatedRoute,private httpClient:HttpClient,private userService:UserService,private data:DataService) {
        this._subUser=this.userService.loggedUser.subscribe(u=>{ this.loggedUser=u;});
        if(localStorage.getItem('user'))
            this.loggedUser=JSON.parse(localStorage.getItem('user'));

        this._subAlert=this.userService.alert.subscribe(a=>{this.alert=a});

        router.events.forEach((event) => {
            if(event instanceof NavigationEnd) {
                this.showSearchDiv=false;
                this.val='';
            }
        });
    }

    ngOnDestroy(){
        this._subUser.unsubscribe();
        this._subAlert.unsubscribe();
    }

    onClick(event){
        if (!this._eref.nativeElement.contains(event.target)){
            this.showNotifications=false;
            this.showSearchDiv=false;
        }
    }

    onFileSelected(event){
        this.file=event.target.files[0];
        this.newPostDiv=true;
    }

    showDiv(){
        this.showNotifications=!this.showNotifications;
    }

    onSearchChange(value){
        if(value.length>1){
            this.searchValue=value;
            this.showSearchDiv=true;
        }else if(value.length==0){
            this.showSearchDiv=false;
        }

    }

    logOut() {
        this.userService.logOut();
        this.loggedUser=of({});
    }

    cancelPost(){
        this.newPostDiv=false;
    }

    addPost(c){
        //uopste se ne poziva funkcija drugi put put
        let caption=c.value;
        let reader=new FileReader();
        reader.onload=(e)=> {
            let buffer=reader.result;
            this.data.addPost(this.loggedUser.id,caption,this.file.name,buffer)
        };
        reader.readAsBinaryString(this.file);
        this.newPostDiv=false;

    }

}
