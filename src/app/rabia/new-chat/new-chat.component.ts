import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UserService } from '../../shared/services/user.service';
import { DABubbleUser } from '../../shared/interfaces/user';
import { InputfieldComponent } from "../../Dimi/chat/chat-inputfield/inputfield.component";
import { CommonModule } from '@angular/common';
import { MessageType } from '../../shared/components/enums/messagetype';

@Component({
  selector: 'app-new-chat',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatInputModule, InputfieldComponent, FormsModule, CommonModule],
  templateUrl: './new-chat.component.html',
  styleUrls: ['./new-chat.component.scss']
})
export class NewChatComponent implements OnInit {
  searchControl = new FormControl();
  searchResults: DABubbleUser[] = [];
  searchQuery: string | undefined;
  isSelectingUser: boolean = false;
  messageType = MessageType.NewDirect;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), switchMap(value => {
      if (this.isSelectingUser) {
        this.isSelectingUser = false;
        return [];
      }
      return this.userService.searchUsersByNameOrEmail(value);
    })
    ).subscribe(results => {
      this.searchResults = results;
    });
  }

  selectUser(user: DABubbleUser) {
    this.isSelectingUser = true;
    this.searchQuery = user.username;
    this.searchControl.setValue(user.username);
    this.searchResults = [];
    this.userService.setSelectedUser(user);
  }
}
