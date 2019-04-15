import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from '../instagram/containers/home/home.component';

const appRoutes:Routes=[
    {path:'',component:HomeComponent},
];

export const AppRouting= RouterModule.forRoot(appRoutes);
