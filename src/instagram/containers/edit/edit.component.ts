import {Component} from '@angular/core';
import {UserService} from '../../services/user.service';
import {User} from '../../models/user.model';

@Component({
    selector:'instagram-edit',
    styleUrls:['edit.component.css'],
    template:`        

        <form (ngSubmit)="onSubmit()" ngNativeValidate class="m-2">
            
            <div class="d-flex  ">
                <div><img src="{{user.image}}" class="smallAvatar m-2"/></div>
                <div>
                    <h3 class=" mb-0">{{user.username}}</h3>

                    <input type="file" class=" inputfile" name="profile" id="profile" (change)="onFSelected($event)">
                    <label for="profile" class="nav-link mb-0 text-primary" >Change Profile Photo</label>
                    
                    
                </div>
            </div>

            <div class="form-group  ">
                <label for="name">Name</label>
                <input
                        [(ngModel)]="user.fullName"
                        name="name"
                        type="text"
                        class="form-control"
                        id="name"
                        placeholder="enter your name">
            </div>

            <div class="form-group">
                <label for="username">Username</label>
                <input
                        [(ngModel)]="user.username"
                        name="username"
                        type="text"
                        required
                        class="form-control"
                        id="username"
                        placeholder="enter your username">
            </div>

            <div class="form-group">
                <label for="bio">Bio</label>
                <textarea
                        [(ngModel)]="user.bio"
                        name="bio"
                        type="text"
                        class="form-control"
                        rows="5"
                        id="bio"
                        placeholder="enter your bio"></textarea>
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input
                        [(ngModel)]="user.email"
                        name="email"
                        type="email"
                        required
                        class="form-control"
                        id="email"
                        placeholder="enter your email">
            </div>

            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
        
        
        
        
        
    `
})

export class EditComponent{

    user:User;
    file;

    constructor(private userService:UserService){
        this.user=this.userService.getloggedUser();
    }

    onFSelected(event){
        this.file=event.target.files[0];
    }

    onSubmit(){

        let reader=new FileReader();
        if(this.file){
            reader.onload=(e)=> {
                let buffer=reader.result;
                this.userService.edit(this.user,this.file.name,buffer);
            };
            reader.readAsBinaryString(this.file);
        }else
            this.userService.edit(this.user,this.file.name,'')




    }
}