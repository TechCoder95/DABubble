import { SidenavComponent } from './tristan/sidenav/sidenav.component';
import { LoginComponent } from './knezovic/components/login/login.component';
import { Routes } from '@angular/router';
import { ChatComponent } from './Dimi/chat/chat.component';
import { ChooseAvatarComponent } from './rabia/choose-avatar/choose-avatar.component';
import { AddUserComponent } from './rabia/add-user/add-user.component';


export const routes: Routes = [
  { path: '', component: SidenavComponent },
  { path: 'add-user', component: AddUserComponent },
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: ChatComponent },
  {path: 'avatar', component: ChooseAvatarComponent},
];
