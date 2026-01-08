import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Userlist } from './pages/userlist/userlist';
import { SurveyList } from './pages/survey-list/survey-list';

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
            },
            {
                path: 'survey-list',
                component: SurveyList
            }
        ]
    }
];
