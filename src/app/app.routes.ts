import { Routes } from '@angular/router';
<<<<<<< HEAD
import { AddUserComponent } from './rabia/add-user/add-user.component';
import { LoginComponent } from './knezovic/components/login/login.component';
import { ChooseAvatarComponent } from './rabia/choose-avatar/choose-avatar.component';


export const routes: Routes = [
    {path: '', component: AddUserComponent},
    {path: 'addUser', component: AddUserComponent},
    {path: 'avatar', component: ChooseAvatarComponent},
    {path: 'login', component: LoginComponent}
];
=======
import { ChatComponent } from './Dimi/chat/chat.component';

export const routes: Routes = [{ path: '', component: ChatComponent }];
>>>>>>> origin/dimi
