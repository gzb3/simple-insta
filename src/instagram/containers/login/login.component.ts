import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {UserService} from '../../services/user.service';

@Component({
    selector: 'app-login',
    styleUrls: ['./login.component.css'],
    template:`        
        <div class="d-flex justify-content-center">
            <div class="c">
                <div>
                    <img src="assets/instagram.png"/>
                    <br>

                    <div *ngIf="errorMessage">
                        <div class="alert alert-danger" role="alert">
                            {{errorMessage}}
                        </div>
                    </div>

                    <form (ngSubmit)="onSubmit()" ngNativeValidate>

                        <div class="form-group">
                            <input
                                    [(ngModel)]="user.username"
                                    name="username"
                                    type="text"
                                    required
                                    class="form-control"
                                    id="username"
                                    placeholder="Username">
                        </div>
                        
                        <div class="form-group">
                            <input
                                    [(ngModel)]="user.password"
                                    name="password"
                                    type="password"
                                    required
                                    class="form-control"
                                    id="password"
                                    placeholder="Password">
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Login</button>
                    </form>
                    <p>
                        <span>Don't have an account?&nbsp;</span>
                        <a [routerLink]="['/signup']">Sign Up!</a>
                    </p>
                </div>
            </div>

        </div>
        
        
    `
})
export class LoginComponent {
    errorMessage;
    user;

    constructor(private data:DataService,private route:ActivatedRoute,private userService:UserService,private router:Router) {
        this.user={username:'',password:''};
        this.data.error.subscribe(err=>{this.errorMessage=err});
    }

    onSubmit(){
        console.log(this.user);
        this.userService.login(this.user.username,this.user.password);
    }


}
