import { Routes } from '@angular/router';
import { AddUserComponent } from './rabia/add-user/add-user.component';
import { LoginComponent } from './knezovic/components/login/login.component';
import { ChooseAvatarComponent } from './rabia/choose-avatar/choose-avatar.component';


export const routes: Routes = [
    {path: '', component: AddUserComponent},
    {path: 'addUser', component: AddUserComponent},
    {path: 'avatar', component: ChooseAvatarComponent},
    {path: 'login', component: LoginComponent}
];
