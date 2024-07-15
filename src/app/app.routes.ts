
import { SidenavComponent } from './tristan/sidenav/sidenav.component';
import { AddUserComponent } from './add-user/add-user.component';
import { LoginComponent } from './knezovic/components/login/login.component';
import { RegisterComponent } from './knezovic/components/register/register.component';
import { Routes } from '@angular/router';


export const routes: Routes = [
    { path: '', component: SidenavComponent },
    { path: 'add-user', component: AddUserComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent }
];
