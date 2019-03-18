import {Component} from '@angular/core';

@Component({
    selector:'accounts',
    styleUrls:['accounts.component.css'],
    template:`
        <div class="m-5">

            <div class="container d-flex  ">
                <aside>
                    <ul class="list-group">
                        <li class="list-group-item">
                            <a routerLink="/accounts/edit" class="text-dark">Edit Profile</a>
                        </li>
                        <li class="list-group-item">
                            <a routerLink="/accounts/password/change" class="text-dark" >Change Password</a>
                        </li>
                    </ul>

                </aside>

                <article >
                    <router-outlet></router-outlet>
                </article>


            </div>

        </div>



    `
})
export class AccountsComponent {
    constructor(){}

}