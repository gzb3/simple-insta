import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from '../instagram/containers/home/home.component';

const appRoutes:Routes=[
    {path:'',component:HomeComponent},
    //{path:'**',component:NotFound}//always last
];

export const AppRouting= RouterModule.forRoot(appRoutes);
