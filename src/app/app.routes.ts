import { Routes } from '@angular/router';
import { AddUserComponent } from './add-user/add-user.component';
import { LoginComponent } from './knezovic/components/login/login.component';
import { RegisterComponent } from './knezovic/components/register/register.component';


export const routes: Routes = [
    {path: '', component: AddUserComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent}
];
