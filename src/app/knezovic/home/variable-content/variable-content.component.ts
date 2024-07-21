import { Component } from '@angular/core';
import { LoginComponent } from "../login/login.component";

@Component({
  selector: 'app-variable-content',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './variable-content.component.html',
  styleUrl: './variable-content.component.scss'
})
export class VariableContentComponent {

}
