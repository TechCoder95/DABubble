import { SidenavComponent } from './tristan/sidenav/sidenav.component';
import { LoginComponent } from './knezovic/home/login/login.component';
import { Routes } from '@angular/router';
import { ChatComponent } from './Dimi/chat/chat.component';
import { ChooseAvatarComponent } from './rabia/choose-avatar/choose-avatar.component';
import { AddUserComponent } from './rabia/add-user/add-user.component';
import { HomeComponent } from './knezovic/home/home.component';
import { StartscreenComponent } from './knezovic/startscreen/startscreen.component';
import { VariableContentComponent } from './knezovic/home/variable-content/variable-content.component';


export const routes: Routes = [
  { path: '', component: StartscreenComponent },
  { path: 'addUser', component: VariableContentComponent },
  { path: 'login', component: VariableContentComponent }, 
  { path: 'chat', component: ChatComponent },
  {path: 'avatar', component: VariableContentComponent},
  {path: 'home', component: HomeComponent},
];
