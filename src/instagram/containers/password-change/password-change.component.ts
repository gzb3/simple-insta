import {Component} from '@angular/core';
import {UserService} from '../../services/user.service';

@Component({
    selector:'instagram-password-change',
    styleUrls:['password-change.component.css'],
    template:`

        <div class="p-2">

            <div *ngIf="errorMessage">
                <div class="alert alert-danger" role="alert">
                    {{errorMessage}}
                </div>
            </div>
            
            <form (ngSubmit)="onSubmit()" ngNativeValidate class="m-2">

                <div class="form-group">
                    <label for="oldPass">Old Password</label>
                    <input
                            [(ngModel)]="oldPassword"
                            name="oldPass"
                            type="password"
                            required
                            class="form-control"
                            id="oldPass"
                    >
                </div>

                <div class="form-group">
                    <label for="newPass">New Password</label>
                    <input
                            [(ngModel)]="newPassword"
                            name="newPass"
                            type="password"
                            required
                            class="form-control"
                            id="newPass"
                    >
                </div>

                <div class="form-group">
                    <label for="confirmPass">Confirm Password</label>
                    <input
                            [(ngModel)]="confirmPassword"
                            name="confirmPass"
                            type="password"
                            required
                            class="form-control"
                            id="confirmPass"
                    >
                </div>
                <button type="submit" class="btn btn-primary">Submit</button>
            </form>
            
        </div>
        
        
    `
})

export class PasswordChangeComponent {
    errorMessage;
    user;
    oldPassword='';
    newPassword='';
    confirmPassword='';
    constructor(private userService:UserService){
        this.user=this.userService.getloggedUser()
    }

    onSubmit(){
        if(this.newPassword!=this.confirmPassword){
            this.errorMessage="Passwords Don't Match"
        }else if(this.oldPassword!=this.user.password){
                this.errorMessage="Wrong Old Password";
        }else{
            this.userService.changePassword({user:this.user,newPassword:this.newPassword});
        }
    }

}