import {Component} from '@angular/core';
import {User} from '../../models/user.model';
import {UserService} from '../../services/user.service';
import {DataService} from '../../services/data.service';

@Component({
    selector:'instagram-signup',
    styleUrls:['signup.component.css'],
    template:`
        <div class="d-flex justify-content-center">
            <div class="c" >
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
                                    placeholder=" username">
                        </div>


                        <div class="form-group">
                            <input
                                    [(ngModel)]="user.email"
                                    name="email"
                                    type="email"
                                    required
                                    class="form-control"
                                    id="email"
                                    placeholder=" email">
                        </div>
                        <div class="form-group">
                            <input
                                    [(ngModel)]="user.password"
                                    name="password"
                                    type="password"
                                    required
                                    class="form-control"
                                    id="password"
                                    placeholder=" password">
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Sign Up</button>
                    </form>
                    <p>
                        <span>Already have an account?&nbsp;</span>
                        <a [routerLink]="['/login']">Log in!</a>
                    </p>
                </div>
            </div>

        </div>
    `
})

export class SignupComponent{
    user:User;
    errorMessage;

    constructor(private userService:UserService,private data:DataService){
        this.user={username:'', email:'', password:''};
        userService.loggedUser.subscribe(u=>{console.log(u)});
        this.data.error.subscribe(e=>{console.log(e);if(e) this.errorMessage=e});
    }
    onSubmit(){
        this.userService.signup(this.user);
    }
}