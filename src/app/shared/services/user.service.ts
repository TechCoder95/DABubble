import { Injectable } from '@angular/core';
import { DABubbleUser } from '../interfaces/user';
import { DatabaseService } from './database.service';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { TextChannel } from '../interfaces/textchannel';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { setDoc, doc } from '@angular/fire/firestore';
import { GlobalsubService } from './globalsub.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  activeUser!: DABubbleUser;
  googleUser!: User;
  guestName: string = 'Guest';

  private selectedUserSubject = new BehaviorSubject<DABubbleUser | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();

  avatarSelected: boolean = false;
  collectionName: string = 'users';

  constructor(
    private DatabaseService: DatabaseService,
    private router: Router,
    private globalSubService: GlobalsubService,
  ) {
    if (sessionStorage.getItem('userLoginGuest')) {
      this.activeUser = JSON.parse(sessionStorage.getItem('userLoginGuest')!)!;
      this.globalSubService.updateUser(this.activeUser);
      this.DatabaseService.subscribeToUserData(this.activeUser.id!);
    } else if (sessionStorage.getItem('userLogin')) {
      //Hier wird der User aus dem SessionStorage geladen
      this.activeUser = JSON.parse(sessionStorage.getItem('userLogin')!);
      this.googleUser = JSON.parse(
        sessionStorage.getItem(
          'firebase:authUser:AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE:[DEFAULT]',
        )!,
      );

      //Hier werden die Observables aktualisiert
      this.globalSubService.updateUser(this.activeUser);

      //Hier sind die User abonniert
      this.DatabaseService.subscribeToUserData(this.activeUser.id!);
      this.globalSubService
        .getGoogleUserObservable()
        .pipe(distinctUntilChanged())
        .subscribe((googleUser) => {
          if (googleUser) {
            this.googleUser = googleUser;
            this.globalSubService.updateGoogleUser(this.googleUser);
          }
        });
      this.DatabaseService.subscribeToOnlineData();
    }
  }

  /**
   * Checks the online status of a user.
   *
   * @param user - The user to check the online status for.
   */
  checkOnlineStatus(user: DABubbleUser) {
    if (user) {
      this.activeUser = user;
      this.globalSubService.updateUser(user);
    } else {
      this.activeUser = null!;
    }
  }

  /**
   * Writes a guest user to the database.
   *
   * @returns {Promise<void>} A promise that resolves when the guest user is successfully written to the database.
   */
  async writeGuestToDB() {
    let guestUser: DABubbleUser = {
      mail: this.guestName + '@' + this.guestName + '.de',
      username: this.guestName,
      uid: '',
      isLoggedIn: true,
      avatar: '/img/4.svg',
    };

    this.DatabaseService.addDataToDB(this.collectionName, guestUser);
    this.globalSubService.updateUser(this.completeUser(guestUser));
    sessionStorage.setItem('userLoginGuest', JSON.stringify(guestUser));
    this.updateLoggedInUser();
    this.checkOnlineStatus(guestUser);
    this.activeUser = guestUser;
    this.router.navigate(['/home']);
  }

  /**
   * Logs in a user using the provided Google user object.
   * If the user is not found in the database, a new user entry is created.
   * If the user is found, the user is logged in and their information is updated.
   * @param googleUser - The Google user object containing the user's information.
   */
  async login(googleUser: User) {
    this.DatabaseService.readDataByField(
      this.collectionName,
      'uid',
      googleUser.uid,
    ).then((user) => {
      this.activeUser = user[0] as unknown as DABubbleUser;
      if (this.activeUser === undefined) {
        this.DatabaseService.addDataToDB(this.collectionName, {
          mail: googleUser.email,
          isLoggedIn: true,
          uid: googleUser.uid,
          username: googleUser.displayName,
          avatar: '',
        }).then((id) => {
          this.DatabaseService.readDataByID(this.collectionName, id).then(
            (user) => {
              let x = user as DABubbleUser;
              this.activeUser = x;
              if (
                this.activeUser.mail === googleUser.email &&
                this.activeUser.id
              ) {
                sessionStorage.setItem(
                  'userLogin',
                  JSON.stringify(this.activeUser),
                );
                this.globalSubService.updateUser(
                  this.completeUser(this.activeUser, this.googleUser),
                );
                this.updateLoggedInUser();
                this.router.navigate(['/user/chooseAvatar']);
              }
            },
          );
        });
      } else {
        if (this.activeUser.uid === googleUser.uid && this.activeUser.id) {
          sessionStorage.setItem('userLogin', JSON.stringify(this.activeUser));
          this.checkOnlineStatus(this.activeUser);
          this.updateLoggedInUser(this.activeUser);
          this.globalSubService.updateUser(this.activeUser);
          if (sessionStorage.getItem('userLogin')) {
            if (
              JSON.parse(sessionStorage.getItem('userLogin')!).avatar.includes(
                'avatar',
              )
            ) {
              this.router.navigate(['/user/chooseAvatar']);
            } else {
              this.router.navigate(['/home']);
            }
          }
        }
      }
    });
  }

  /**
   * Completes the user object by filling in missing properties with values from the Google user object.
   * If a property is already present in the user object, it will not be overwritten.
   *
   * @param user - The user object to be completed.
   * @param googleUser - The Google user object containing additional information.
   * @returns The completed user object.
   */
  completeUser(user: DABubbleUser, googleUser?: User) {
    return (user = {
      id: user.id,
      mail: user.mail || googleUser?.email || '',
      username: user.username ? user.username : googleUser?.displayName || '',
      uid: user.uid || googleUser?.uid || '',
      isLoggedIn: user.isLoggedIn || true,
      avatar: user.avatar || '',
    });
  }

  /**
   * Updates the logged-in user's status and calls the updateUser method.
   */
  async updateLoggedInUser(loginUser?: DABubbleUser) {
    if (loginUser) {
      this.activeUser.mail = loginUser!.mail;
    }
    this.activeUser.isLoggedIn = true;
    this.DatabaseService.readDataByField(
      'onlinestatus',
      'id',
      'VZxZWTcEoLUUZGgItgwS',
    ).then((data) => {
      if (data) {
        let onlineUser = data[0].onlineUser;
        onlineUser.push(this.activeUser.id);
        this.DatabaseService.updateDataInDB(
          'onlinestatus',
          'VZxZWTcEoLUUZGgItgwS',
          { onlineUser: onlineUser },
        );
      }
    });
    this.updateUser(this.activeUser);
  }

  /**
   * Logs out the user.
   * If the user is logged in as a guest, it calls the `guestLogout` method.
   * Otherwise, it updates the user's data in the database, removes the user login information from local and session storage,
   * clears the selected channel ID from session storage, emits a null value for the active user subject,
   * and navigates to the login page.
   */
  async logout() {
    if (sessionStorage.getItem('userLogin')) {
      let id = JSON.parse(sessionStorage.getItem('userLogin')!).id;

      this.DatabaseService.readDataByArray(
        'onlinestatus',
        'onlineUser',
        id,
      ).then((data) => {
        if (data.length > 0) {
          let onlineUser = data[0].onlineUser;
          let index = onlineUser.indexOf(id);
          onlineUser.splice(index, 1);
          this.DatabaseService.updateDataInDB(
            'onlinestatus',
            'VZxZWTcEoLUUZGgItgwS',
            { onlineUser: onlineUser },
          );
        }
      });

      this.DatabaseService.updateDataInDB(this.collectionName, id, {
        isLoggedIn: false,
      }).then(() => {
        sessionStorage.removeItem('userLogin');
        sessionStorage.removeItem('selectedChannel');
        sessionStorage.removeItem('selectedThread');
        sessionStorage.removeItem('channels');
        sessionStorage.removeItem('threadMessage');
        this.router.navigate(['/user/login']);
      });
    }
  }

  /**
   * Registers a new user with the provided email, username, and uid.
   * @param email - The email of the user.
   * @param username - The username of the user.
   * @param uid - The unique identifier of the user.
   */
  async register(email: string, username: string, uid: string) {
    let data: DABubbleUser = {
      mail: email,
      username: username,
      uid: uid,
      isLoggedIn: false,
      avatar: '/img/avatar.svg',
    };
    await this.DatabaseService.addDataToDB(this.collectionName, data);
    this.login(this.googleUser);
  }

  /**
   * Updates a user in the database.
   *
   * @param user - The user object to update.
   * @returns A Promise that resolves when the user is updated.
   */
  async updateUser(user: DABubbleUser) {
    await this.DatabaseService.updateDataInDB(this.collectionName, user.id!, user,);
  }

  /**
   * Updates the username of the active user.
   *
   * @param {string} username - The new username to be set.
   */
  updateUsername(username: string) {
    this.activeUser.username = username;
    this.updateUser(this.activeUser);    
  }

  /**
   * Deletes a user from the database.
   * @param {string} userID - The ID of the user to be deleted.
   * @returns {Promise<void>} - A promise that resolves when the user is deleted.
   */
  async deleteUser(userID: string) {
    await this.DatabaseService.deleteDataFromDB(this.collectionName, userID);
  }

  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user object matching the specified ID, or undefined if no user is found.
   */
  async getOneUserbyId(id: string): Promise<DABubbleUser> {
    let DAUser = await this.DatabaseService.readDataByID(
      this.collectionName,
      id,
    );

    return DAUser as DABubbleUser;
  }

  /**
   * Retrieves the channels assigned to a user.
   *
   * @param userId - The ID of the user.
   * @returns A promise that resolves to an array of TextChannel objects.
   */
  async getUserChannels(userId: string): Promise<TextChannel[]> {
    const channelsCollectionRef =
      await this.DatabaseService.getDataRef('channels');
    const q = query(
      channelsCollectionRef,
      where('assignedUser', 'array-contains', userId),
    );
    const snapshot = await getDocs(q);
    const channels: TextChannel[] = [];
    snapshot.forEach((doc) => channels.push(doc.data() as TextChannel));
    return channels;
  }

  /**
   * Searches for users by name or email.
   *
   * @param searchText - The text to search for in the username or email.
   * @returns A promise that resolves to an array of DABubbleUser objects matching the search criteria.
   */
  async searchUsersByNameOrEmail(searchText: string): Promise<DABubbleUser[]> {
    const usersRef = collection(this.DatabaseService.firestore, 'users');
    const lowerCaseSearchText = searchText.toLowerCase();

    const querySnapshot = await getDocs(usersRef);
    const users: DABubbleUser[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DABubbleUser;
      data.id = doc.id;
      if (this.usernameOrEmailMatchText(data, lowerCaseSearchText)) {
        users.push(data);
      }
    });
    return users;
  }

  /**
   * Searches for users excluding the selected users.
   *
   * @param searchText - The text to search for.
   * @param selectedUsers - An array of selected users to exclude from the search results.
   * @returns A promise that resolves to an array of users matching the search criteria, excluding the selected users.
   */
  async searchUsersExcludingSelected(
    searchText: string,
    selectedUsers: DABubbleUser[],
  ): Promise<DABubbleUser[]> {
    const usersRef = collection(this.DatabaseService.firestore, 'users');
    const lowerCaseSearchText = searchText.toLowerCase();

    const querySnapshot = await getDocs(usersRef);
    const users: DABubbleUser[] = [];

    const selectedUserIds = new Set(selectedUsers.map((user) => user.id));

    querySnapshot.forEach((doc) => {
      const data = doc.data() as DABubbleUser;
      data.id = doc.id;
      if (
        this.usernameOrEmailMatchText(data, lowerCaseSearchText) &&
        !selectedUserIds.has(data.id)
      ) {
        users.push(data);
      }
    });
    return users;
  }

  /**
   * Checks if the given data's username or email matches the provided search text.
   *
   * @param data - The data object to check.
   * @param lowerCaseSearchText - The search text to match against the username or email.
   * @returns True if the username or email matches the search text, false otherwise.
   */
  usernameOrEmailMatchText(data: any, lowerCaseSearchText: string) {
    return (
      (data.username &&
        data.username.toLowerCase().includes(lowerCaseSearchText)) ||
      (data.mail && data.mail.toLowerCase().includes(lowerCaseSearchText))
    );
  }

  /**
   * Sets the selected user.
   *
   * @param user - The user to be set as the selected user. Pass `null` to clear the selected user.
   */
  setSelectedUser(user: DABubbleUser | null) {
    this.selectedUserSubject.next(user);
  }

  /**
   * Retrieves the selected user.
   *
   * @returns The selected user or null if no user is selected.
   */
  getSelectedUser(): DABubbleUser | null {
    return this.selectedUserSubject.value;
  }

  /**
   * Retrieves all users from the database.
   * @returns A promise that resolves to an array of DABubbleUser objects.
   */
  async getAllUsersFromDB(): Promise<DABubbleUser[]> {
    const users = await this.DatabaseService.readDataFromDB('users');
    return users as DABubbleUser[];
  }

  /**
   * Retrieves the default user by their UID.
   *
   * @param uid - The UID of the user.
   * @returns A Promise that resolves to a DABubbleUser object if found, otherwise undefined.
   */
  async getDefaultUserByUid(uid: string): Promise<DABubbleUser | undefined> {
    const usersRef = collection(
      this.DatabaseService.firestore,
      this.collectionName,
    );
    const q = query(usersRef, where('uid', '==', uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return undefined;
    } else {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as DABubbleUser;
    }
  }

  /**
   * Adds a default user to the database.
   *
   * @param user - The user object to be added to the database.
   * @returns A promise that resolves with the ID of the added user.
   * @throws If there is an error adding the user to the database.
   */
  async addDefaultUserToDatabase(user: DABubbleUser): Promise<string> {
    try {
      const userRef = doc(
        collection(this.DatabaseService.firestore, this.collectionName),
      );
      user.id = userRef.id;

      await setDoc(userRef, user);
      return userRef.id;
    } catch (err) {
      console.error('Error adding user to DB', err);
      throw err;
    }
  }

  /**
   * Creates default users in the system.
   *
   * @returns A promise that resolves to an array of DABubbleUser objects representing the default users.
   */
  async createDefaultUsers(): Promise<DABubbleUser[]> {
    const defaultUsers: DABubbleUser[] = [
      {
        id: '',
        username: 'Felix',
        mail: 'Felix@example.com',
        isLoggedIn: true,
        avatar: '/img/1.svg',
        uid: 'Felix-uid',
      },
      {
        id: '',
        username: 'Jimmy',
        mail: 'Jimmy@example.com',
        isLoggedIn: false,
        avatar: '/img/2.svg',
        uid: 'Jimmy-uid',
      },
      {
        id: '',
        username: 'Mia',
        mail: 'Mia@example.com',
        isLoggedIn: true,
        avatar: '/img/3.svg',
        uid: 'Mia-uid',
      },
    ];

    for (let i = 0; i < defaultUsers.length; i++) {
      const user = defaultUsers[i];
      const existingUser = await this.getDefaultUserByUid(user.uid!);

      if (!existingUser) {
        const userId = await this.addDefaultUserToDatabase(user);
        defaultUsers[i].id = userId;
      } else {
        defaultUsers[i] = existingUser;
      }
    }

    return defaultUsers;
  }

}
