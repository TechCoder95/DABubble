import { SidenavComponent } from './tristan/sidenav/sidenav.component';
import { LoginComponent } from './knezovic/home/login/login.component';
import { Routes } from '@angular/router';
import { ChatComponent } from './Dimi/chat/chat.component';
import { ChooseAvatarComponent } from './rabia/choose-avatar/choose-avatar.component';
import { AddUserComponent } from './rabia/add-user/add-user.component';
import { HomeComponent } from './knezovic/home/home.component';
import { StartscreenComponent } from './knezovic/startscreen/startscreen.component';
import { VariableContentComponent } from './knezovic/home/variable-content/variable-content.component';
import { isLoggedIn } from './shared/guards/authguard.guard';
import { PasswordResetComponent } from './rabia/password-reset/password-reset.component';


export const routes: Routes = [
  { path: '', component: StartscreenComponent },
  { path: 'user', component: VariableContentComponent, 
    children: [
    {path: 'register', component: AddUserComponent},
    {path: 'chooseAvatar', component: ChooseAvatarComponent},
    {path: 'login', component: LoginComponent},
  ]}, 
  { path: 'chat', component: ChatComponent  , canActivate: [isLoggedIn]},
  {path: 'home', component: HomeComponent , canActivate: [isLoggedIn]},
  {path: 'verfiyEmail', component: VariableContentComponent},
  {path: 'pw', component: PasswordResetComponent},
];
