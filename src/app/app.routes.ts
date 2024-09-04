import { LoginComponent } from './knezovic/home/login/login.component';
import { Routes } from '@angular/router';
import { ChooseAvatarComponent } from './rabia/choose-avatar/choose-avatar.component';
import { AddUserComponent } from './rabia/add-user/add-user.component';
import { StartscreenComponent } from './knezovic/startscreen/startscreen.component';
import { VariableContentComponent } from './knezovic/home/variable-content/variable-content.component';
import { isLoggedIn } from './shared/guards/authguard.guard';
import { PasswordResetComponent } from './rabia/password-reset/password-reset.component';
import { PasswordChangeComponent } from './rabia/password-change/password-change.component';
import { ImprintComponent } from './rabia/imprint/imprint.component';
import { PrivacyComponent } from './rabia/privacy/privacy.component';
import { ChatComponent } from './Dimi/chat/chat.component';
import { ThreadComponent } from './rabia/thread/thread.component';
import { NewChatComponent } from './rabia/new-chat/new-chat.component';


export const routes: Routes = [
  { path: '', component: StartscreenComponent },
  {
    path: 'user', component: VariableContentComponent,

    //hier wird Lazy Loading noch eingebaut!

    children: [
      { path: 'register', component: AddUserComponent },
      { path: 'chooseAvatar', component: ChooseAvatarComponent },
      { path: 'login', component: LoginComponent },
      { path: 'password-reset', component: PasswordResetComponent },
      { path: 'password-change', component: PasswordChangeComponent },
      { path: 'imprint', component: ImprintComponent },
      { path: 'privacy', component: PrivacyComponent },
    ]
  },
  {
    path: 'home', canActivate: [isLoggedIn],
    children: [
      {
        path: 'channel/:channelId', component: ChatComponent,
        children: [
          {
            path: 'thread/:threadId', component: ThreadComponent,
          },
        ]
      },
      {
        path: 'new-chat', component: NewChatComponent,
      }
    ]
  },
  { path: 'verfiyEmail', component: VariableContentComponent },
  {
    path: 'channel/:channelId', component: ChatComponent,
    children: [
      {
        path: 'thread/:threadId', component: ThreadComponent,
      },
    ]
  }, {
    path: 'thread/:threadId', component: ChatComponent,
  },
  {
    path: "**", redirectTo: "home"
  }
];

