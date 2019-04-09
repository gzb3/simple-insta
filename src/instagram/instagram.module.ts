import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ProfileComponent } from '../instagram/containers/profile/profile.component';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './containers/home/home.component';
import {LoginComponent} from './containers/login/login.component';
import {DataService} from './services/data.service';
import {UserService} from './services/user.service';
import {HttpClientModule} from '@angular/common/http';
import {PostListComponent} from './containers/post-list/post-list.component';
import {PostComponent} from './containers/post/post.component';
import {LinkifyPipe} from './pipes/linkify.pipe';
import {HashtagComponent} from './containers/hashtags/hashtag-component';
import {EditComponent} from './containers/edit/edit.component';
import {PasswordChangeComponent} from './containers/password-change/password-change.component';
import {AccountsComponent} from './components/accounts/accounts.component';
import {DisplayPostComponent} from './components/display-post/display-post.component';
import {SignupComponent} from './containers/signup/signup.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FollowingComponent} from './containers/following/following.component';
import {FollowersComponent} from './containers/followers/followers.component';


const routes:Routes=[
    {path:'login',component:LoginComponent},
    {path:'signup',component:SignupComponent},

    {path:'accounts',component:AccountsComponent,
        children:[{path:'edit',component:EditComponent},
                  {path:'password', children:[{path:'change',component:PasswordChangeComponent}]},

        ]
    },
    {path:'p/:id',component:PostComponent},
    {path:':username',component:ProfileComponent,
        children:[
            {path:'following',component:FollowingComponent},
            {path:'followers', component:FollowersComponent}
        ]},
    {path:'explore',
        children:[{path:'tags/:hashtag',component:HashtagComponent}]
    },

];



@NgModule({
    declarations: [
        LinkifyPipe,
        ProfileComponent,
        LoginComponent,
        HomeComponent,
        PostListComponent,
        PostComponent,
        PasswordChangeComponent,
        EditComponent,
        DisplayPostComponent,
        FollowingComponent,
        FollowersComponent,
        SignupComponent,
        AccountsComponent,
        HashtagComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        BrowserModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,

    ],
    exports: [RouterModule],
    providers: [DataService,UserService],
    bootstrap: []
})
export class InstagramModule { }
