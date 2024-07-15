import { Component, Input } from '@angular/core';
import { DialogChannelMembersComponent } from '../dialog-channel-members.component';
DialogChannelMembersComponent;

@Component({
  selector: 'app-member',
  standalone: true,
  imports: [],
  templateUrl: './member.component.html',
  styleUrl: './member.component.scss',
})
export class MemberComponent {
  @Input() member: any;
}
