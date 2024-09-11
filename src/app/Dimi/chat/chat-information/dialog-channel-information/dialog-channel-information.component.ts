import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Inject,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../../shared/services/channel.service';
import { map, Observable } from 'rxjs';
import { UserService } from '../../../../shared/services/user.service';
import { DABubbleUser } from '../../../../shared/interfaces/user';
import { TextChannel } from '../../../../shared/interfaces/textchannel';
import { Router } from '@angular/router';
import { GlobalsubService } from '../../../../shared/services/globalsub.service';
import { DialogChannelMembersComponent } from '../dialog-channel-members/dialog-channel-members.component';
import { DatabaseService } from '../../../../shared/services/database.service';

@Component({
  selector: 'app-dialog-channel-information',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    CommonModule,
    DialogChannelMembersComponent,
  ],
  templateUrl: './dialog-channel-information.component.html',
  styleUrl: './dialog-channel-information.component.scss',
})
export class DialogChannelInformationComponent {
  closeImg = './img/close-default.png';
  channelName: string = 'Entwicklerteam';
  /* TO EDIT NAME */
  @ViewChild('editChannelNameSection') editChannelNameSection!: ElementRef;
  @ViewChild('editName') editButton!: ElementRef;
  @ViewChild('title1') title1!: ElementRef;
  @ViewChild('channelName') channelNameDiv!: ElementRef;
  @ViewChild('channelNameInput') ChannelNameInput!: ElementRef;
  @ViewChild('updatedChannelName') updatedChannelName!: ElementRef;
  /* TO EDIT DESCRIPTION */
  @ViewChild('editChannelDescriptionSection')
  editChannelDescriptionSection!: ElementRef;
  @ViewChild('editDescription') editDescriptionButton!: ElementRef;
  @ViewChild('title2') title2!: ElementRef;
  @ViewChild('channelDescription') channelDescriptionDiv!: ElementRef;
  @ViewChild('channelCreator') channelCreator!: ElementRef;
  @ViewChild('updatedChannelDescription')
  updatedChannelDescription!: ElementRef;
  channelCreatorObject!: DABubbleUser;
  channelCreatorName!: string;
  isMobileAndInChannelInformation!: boolean;

  selectedChannel: TextChannel = JSON.parse(
    sessionStorage.getItem('selectedChannel')!,
  );

  constructor(
    public dialogRef: MatDialogRef<DialogChannelInformationComponent>,
    public channelService: ChannelService,
    private userService: UserService,
    private router: Router,
    private subscriptionService: GlobalsubService,
    private dataService: DatabaseService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.isMobileAndInChannelInformation = data.isMobileAndInChannelInformation;
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.selectedChannel = JSON.parse(
      sessionStorage.getItem('selectedChannel')!,
    );

    this.dataService.readDataByField('users', 'id', this.selectedChannel.owner).then((value) => {
      let user = value[0] as DABubbleUser;
      this.channelCreatorName = `${user.username}`;
    }
    );

    this.subscriptionService
      .getActiveChannelObservable()
      .subscribe((channel: TextChannel) => {
        this.selectedChannel = channel;
      });
  }


  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

  }

  /**
   * Changes the close image based on the hover state.
   *
   * @param hover - A boolean indicating whether the mouse is hovering over the image.
   */
  changeCloseImg(hover: boolean) {
    if (hover) {
      this.closeImg = './img/close-hover.png';
    } else {
      this.closeImg = './img/close-default.png';
    }
  }

  /**
   * Closes the dialog.
   */
  closeDialog() {
    this.dialogRef.close(false);
  }

  inEditModeName: boolean = false;
  /**
   * Toggles the edit mode for the channel name.
   */
  editChannelName() {
    if (!this.inEditModeName) {
      this.editChannelNameTrue();
    } else {
      this.editChannelNameFalse();
    }
  }

  /**
   * Enables the edit mode for the channel name.
   * This function sets various properties and classes to enable editing of the channel name.
   */
  editChannelNameTrue() {
    this.inEditModeName = true;
    this.editChannelNameSection.nativeElement.classList.add(
      'edit-mode-channel-name-section',
    );
    this.editButton.nativeElement.textContent = 'Speichern';
    this.editButton.nativeElement.classList.add('edit-mode');
    this.title1.nativeElement.classList.add('edit-mode-title');
    this.channelNameDiv.nativeElement.classList.add('edit-mode-channel-name');
  }

  /**
   * Sets the edit mode for the channel name to false.
   * If the updated channel name is not empty, it saves the new channel name.
   * Removes the edit mode classes and updates the text content of the edit button.
   */
  editChannelNameFalse() {
    let updatedName = this.updatedChannelName.nativeElement.value;
    if (updatedName !== '') {
      this.saveNewChannelName(updatedName);
    }
    this.inEditModeName = false;
    this.editChannelNameSection.nativeElement.classList.remove(
      'edit-mode-channel-name-section',
    );
    this.editButton.nativeElement.textContent = 'Bearbeiten';
    this.editButton.nativeElement.classList.remove('edit-mode');
    this.title1.nativeElement.classList.remove('edit-mode-title');
    this.channelNameDiv.nativeElement.classList.remove(
      'edit-mode-channel-name',
    );
  }

  /**
   * Saves the new channel name.
   *
   * @param updatedName - The updated name of the channel.
   * @returns void
   */
  async saveNewChannelName(updatedName: string) {
    const nameExists =
      await this.channelService.doesChannelNameAlreadyExist(updatedName);
    if (nameExists) {
      // todo fehlermeldung zurück geben eventuell
      alert(`Ein Kanal mit dem Namen "${updatedName}" existiert bereits.`);
      return;
    }
    this.selectedChannel.name = updatedName;
    this.channelService.updateChannelName(updatedName);
    sessionStorage.setItem(
      'selectedChannel',
      JSON.stringify(this.selectedChannel),
    );
    await this.router.navigate(['/home']);
    setTimeout(async () => {
      this.router.navigate(['/home/channel', this.selectedChannel.id]);
    }, 0.1);
    this.subscriptionService.updateActiveChannel(this.selectedChannel);
  }

  /**
   * Saves the updated channel description and performs necessary actions.
   *
   * @param updatedDescription - The updated description of the channel.
   * @returns A Promise that resolves when the channel description is saved and actions are performed.
   */
  async saveNewChannelDescription(updatedDescription: string) {
    this.selectedChannel.description = updatedDescription;
    this.channelService.updateChannelDescription(updatedDescription);
    sessionStorage.setItem(
      'selectedChannel',
      JSON.stringify(this.selectedChannel),
    );
    await this.router.navigate(['/home']);
    setTimeout(async () => {
      this.router.navigate(['/home/channel', this.selectedChannel.id]);
    }, 0.1);
    this.subscriptionService.updateActiveChannel(this.selectedChannel);
  }

  inEditModeDescription: boolean = false;
  /**
   * Toggles the edit mode for the channel description.
   */
  editChannelDescription() {
    if (!this.inEditModeDescription) {
      this.editChannelDescriptionTrue();
    } else {
      this.editChannelDescriptionFalse();
    }
  }

  /**
   * Enables the edit mode for the channel description.
   * - Sets the inEditModeDescription flag to true.
   * - Adds CSS classes to the necessary elements to indicate the edit mode.
   * - Updates the text content and CSS class of the edit description button.
   * - Adjusts the margin top, width, and CSS class of the channel description div.
   * - Adjusts the padding bottom of the channel creator element.
   */
  editChannelDescriptionTrue() {
    this.inEditModeDescription = true;
    this.editChannelDescriptionSection.nativeElement.classList.add(
      'edit-mode-channel-description-section',
    );
    this.editDescriptionButton.nativeElement.textContent = 'Speichern';
    this.editDescriptionButton.nativeElement.classList.add('edit-mode');
    this.title2.nativeElement.classList.add('edit-mode-title');
    this.channelDescriptionDiv.nativeElement.style.marginTop = '20px';
    /* this.channelDescriptionDiv.nativeElement.style.width = '465px'; */
    this.channelDescriptionDiv.nativeElement.classList.add(
      'edit-mode-channel-name',
    );
    this.channelCreator.nativeElement.style.paddingBottom = '20px';
  }

  /**
   * Sets the edit mode for the channel description to false.
   *
   * This function updates the channel description based on the value entered in the updatedChannelDescription input field.
   * If the updated description is not empty, it calls the saveNewChannelDescription function to save the new description.
   * It then sets the inEditModeDescription flag to false and removes the necessary CSS classes and styles to exit the edit mode.
   * Finally, it updates the text content and CSS classes of the editDescriptionButton and title2 elements, and adjusts the styling of the channelDescriptionDiv and channelCreator elements.
   */
  editChannelDescriptionFalse() {
    let updatedDescription = this.updatedChannelDescription.nativeElement.value;
    if (updatedDescription !== '') {
      this.saveNewChannelDescription(updatedDescription);
    }
    this.inEditModeDescription = false;
    this.editChannelDescriptionSection.nativeElement.classList.remove(
      'edit-mode-channel-description-section',
    );
    this.editDescriptionButton.nativeElement.textContent = 'Bearbeiten';
    this.editDescriptionButton.nativeElement.classList.remove('edit-mode');
    this.title2.nativeElement.classList.remove('edit-mode-title');
    this.channelDescriptionDiv.nativeElement.style.marginTop = '0';
    /*  this.channelDescriptionDiv.nativeElement.style.width = 'unset'; */
    this.channelDescriptionDiv.nativeElement.classList.remove(
      'edit-mode-channel-name',
    );
    this.channelCreator.nativeElement.style.paddingBottom = '0';
  }

  /**
   * Returns an observable that emits the placeholder text for the channel information dialog.
   * The placeholder text is derived from the selected channel's name, or defaults to 'Channel' if the name is undefined.
   *
   * @returns An observable that emits the placeholder text.
   */
  get placeholderText(): Observable<string> {
    return this.channelService.selectedChannel$.pipe(
      map((channel: any) => `${channel?.name || 'Channel'}`),
    );
  }


  /**
   * Leaves the channel and performs necessary actions.
   * - Calls the `leaveChannel` method of the `channelService`.
   * - Updates the sidenav tree using the `updateSidenavTree` method of the `subscriptionService`.
   * - Closes the dialog using the `close` method of the `dialogRef`.
   * - Navigates to the 'home' route using the `navigate` method of the `router`.
   * @returns A promise that resolves when the channel is left and all actions are completed.
   */
  async onLeaveChannel() {
    await this.channelService.leaveChannel();
    this.subscriptionService.updateSidenavTree();
    this.dialogRef.close();
    await this.router.navigate(['home']);
  }
  /*  isMobileAndChannelInformation: boolean = false;
  checkDialogSettings() {
    if (window.innerWidth < 910) {
      this.isMobileAndChannelInformation = true;
    } else {
      this.isMobileAndChannelInformation = false;
    }
  } */
}
