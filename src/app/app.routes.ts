import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Userlist } from './pages/userlist/userlist';

export const routes: Routes = [
    {
        path:'',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path:'login',
        component: Login
    },
    {
        path: '',
        component: Home,
        children:[
            {
                path: 'user-list',
                component: Userlist
            }
        ]
    }
];
