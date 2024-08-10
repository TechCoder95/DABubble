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
import { PasswordChangeComponent } from './rabia/password-change/password-change.component';
import { ImprintComponent } from './rabia/imprint/imprint.component';
import { PrivacyComponent } from './rabia/privacy/privacy.component';


export const routes: Routes = [
  { path: '', component: StartscreenComponent },
  {
    path: 'user', component: VariableContentComponent,
    children: [
      { path: 'register', component: AddUserComponent },
      { path: 'chooseAvatar', component: ChooseAvatarComponent },
      { path: 'login', component: LoginComponent },
      { path: 'password-reset', component: PasswordResetComponent },
      { path: 'password-change', component: PasswordChangeComponent},
      { path: 'imprint', component: ImprintComponent },
      { path: 'privacy', component: PrivacyComponent },
    ]
  },
  { path: 'home', component: HomeComponent, canActivate: [isLoggedIn] },
  { path: 'verfiyEmail', component: VariableContentComponent },

  
];
