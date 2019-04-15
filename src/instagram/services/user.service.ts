import {Injectable} from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {User} from '../models/user.model';
import {Router} from '@angular/router';

@Injectable()
export class UserService  {

    loggedUser=this.socket.fromEvent<User>('user');
    alert=this.socket.fromEvent<any>('alert');
    notifications=this.socket.fromEvent<any>('notifications');

    constructor(private socket:Socket,private router:Router) {
        this.loggedUser.subscribe(user=>{
            localStorage.setItem('user',JSON.stringify(user));
            router.navigate(['/'+user.username]);
        });
        if(localStorage.getItem('user'))
            this.socket.emit('loggedUser',JSON.parse(localStorage.getItem('user')));//Sends user to server so that it can include it into userSockets array
    }

    getloggedUser(){
        return JSON.parse(localStorage.getItem('user'));
    }
    getLogUserObservable(){
        return this.loggedUser;
    }

    getNotifications(userId){
        this.socket.emit('getNotifications',userId);
    }

    login(username,password){
        this.socket.emit('login',{username:username,password:password});
    }
    signup(user){
        this.socket.emit('signup',user);
    }

    logOut(){
        localStorage.removeItem('user');
        this.router.navigate(['/']);

    }

    edit(user,filename,buffer){
        this.socket.emit('edit',{user:user,fileName:filename,buffer:buffer});
    }

    changePassword(data){//user,newPassword
        this.socket.emit('changePassword',data)
    }
}
