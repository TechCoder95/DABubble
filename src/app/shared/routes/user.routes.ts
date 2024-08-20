import { Routes } from "@angular/router";
import { VariableContentComponent } from "../../knezovic/home/variable-content/variable-content.component";
import { AddUserComponent } from "../../rabia/add-user/add-user.component";
import { ChooseAvatarComponent } from "../../rabia/choose-avatar/choose-avatar.component";
import { LoginComponent } from "../../knezovic/home/login/login.component";
import { PasswordResetComponent } from "../../rabia/password-reset/password-reset.component";
import { PasswordChangeComponent } from "../../rabia/password-change/password-change.component";
import { ImprintComponent } from "../../rabia/imprint/imprint.component";
import { PrivacyComponent } from "../../rabia/privacy/privacy.component";

const userRoutes : Routes = [

    //Vorbereitung für Lazy Loading

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
]



export default userRoutes;