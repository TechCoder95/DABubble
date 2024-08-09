import { Injectable } from '@angular/core';
import { DABubbleUser } from '../interfaces/user';
import { DatabaseService } from './database.service';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TextChannel } from '../interfaces/textchannel';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { setDoc, doc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users: DABubbleUser[] = [];
  activeUser!: DABubbleUser;
  googleUser!: User;
  guestName: string = 'Guest';

  private selectedUserSubject = new BehaviorSubject<DABubbleUser | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();

  //Aktiver User aus der Datenbank Firestore wird in das Subject geschrieben
  activeUserSubject = new BehaviorSubject<DABubbleUser>(this.activeUser);
  activeUserObserver$ = this.activeUserSubject.asObservable();

  //Aktiver Google User wird in das Subject geschrieben
  activeGoogleUserSubject = new BehaviorSubject<User>(this.googleUser);
  activeGoogleUserObserver$ = this.activeGoogleUserSubject.asObservable();

  avatarSelected: boolean = false;
  collectionName: string = 'users';

  constructor(private DatabaseService: DatabaseService, private router: Router) {
    this.getUsersFromDB().then(() => {
      if (sessionStorage.getItem('userLoginGuest')) {
        this.activeUser = this.users.find(user => user.id === sessionStorage.getItem('userLoginGuest')!)!;
        this.activeUserSubject.next(this.activeUser);
        this.DatabaseService.subscribeToData(this.collectionName, this.activeUser.id!);
        this.DatabaseService.onDomiDataChange$.subscribe((data) => {
          this.activeUserSubject.next(data);
        });
      }
      else if (sessionStorage.getItem('userLogin')) {
        this.activeUser = this.users.find(user => user.id === sessionStorage.getItem('userLogin')!)!;
        this.activeUserSubject.next(this.activeUser);
        this.DatabaseService.subscribeToData(this.collectionName, this.activeUser.id!);
        this.DatabaseService.onDomiDataChange$.subscribe((data) => {
          this.activeUserSubject.next(data);
        });
        this.activeGoogleUserObserver$.subscribe((googleUser) => {
          if (googleUser) {
            this.googleUser = googleUser;
          }
          else {
            if (sessionStorage.getItem('firebase:authUser:AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE:[DEFAULT]')) {
              let user = sessionStorage.getItem('firebase:authUser:AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE:[DEFAULT]');
              this.googleUser = JSON.parse(user!);
              this.activeGoogleUserSubject.next(this.googleUser);
            }
          }
        });
      }
    });
  }


  /**
   * Checks the online status of a user.
   * 
   * @param user - The user to check the online status for.
   */
  checkOnlineStatus(user: DABubbleUser) {
    if (user) {
      this.activeUser = user;
      this.activeUserSubject.next(user);
    } else {
      this.activeUser = null!;
      this.activeUserSubject.next(null!);
    }
  }


  /**
   * Retrieves users from the database.
   * @returns {Promise<void>} A promise that resolves when the users are retrieved.
   */
  async getUsersFromDB() {
    await this.DatabaseService.readDatafromDB(this.collectionName, this.users);
  }


  /**
   * Performs a guest login by generating a unique guest name and writing it to the database.
   */
  guestLogin() {
    this.getUsersFromDB().then(() => {
      let name = this.guestName;
      let i = 1;
      while (this.users.find(user => user.username === name)) {
        name = this.guestName + '_' + i;
        i++;
      }
      this.guestName = name;
      this.writeGuestToDB();
    });
  }


  /**
   * Writes a guest user to the database.
   * 
   * @returns {Promise<void>} A promise that resolves when the guest user is successfully written to the database.
   */
  async writeGuestToDB() {
    let guestUser: DABubbleUser = { mail: this.guestName + '@' + this.guestName + '.de', username: this.guestName, uid: '', isLoggedIn: true, avatar: '/img/4.svg', activeChannels: [] };

    this.DatabaseService.addDataToDB(this.collectionName, guestUser);
    this.getUsersFromDB().then(() => {
      this.users.map(user => {
        if (user.mail === guestUser.mail && user.id) {
          this.activeUser = user;
          this.activeUserSubject.next(this.completeUser(this.activeUser));
          sessionStorage.setItem('userLoginGuest', this.activeUser.id!);
          this.updateLoggedInUser();
          this.checkOnlineStatus(this.activeUser);
          this.router.navigate(['/home']);
        }
      });
    });
  }


  /**
   * Logs out the guest user.
   * Removes the user login from the session storage, updates the active user subject,
   * deletes the user data from the database, and reloads the page.
   */
  guestLogout() {
    let id = sessionStorage.getItem('userLoginGuest')!;
    this.activeUser = null!;
    this.DatabaseService.deleteDataFromDB(this.collectionName, id)
      .then(() => {
        sessionStorage.removeItem('userLoginGuest');
        this.activeUserSubject.next(null!);
        this.getUsersFromDB().then(() => {
          window.location.reload();
        });
      });
  }


  /**
   * Logs in a user using the provided Google user object.
   * If the user is not found in the database, a new user entry is created.
   * If the user is found, the user is logged in and their information is updated.
   * @param googleUser - The Google user object containing the user's information.
   */
  async login(googleUser: User) {
    this.activeGoogleUserSubject.next(googleUser);
    this.getUsersFromDB().then(() => {
      let loginUser = this.users.find(user => user.uid === googleUser.uid);

      if (loginUser === undefined) {
        this.DatabaseService.addDataToDB(this.collectionName, { mail: googleUser.email, isLoggedIn: true, activeChannels: [], uid: googleUser.uid, username: googleUser.displayName, avatar: "" }).then(() => {
          this.getUsersFromDB().then(() => {
            this.users.map(user => {
              if (user.mail === googleUser.email && user.id) {
                sessionStorage.setItem('userLogin', user.id);
                this.activeUserSubject.next(this.completeUser(user, googleUser));
                this.updateLoggedInUser();
                

                this.router.navigate(['/user/chooseAvatar']);
              }
            });
          });
        });
      } else {
        if (loginUser.uid === googleUser.uid && loginUser.id) {
          sessionStorage.setItem('userLogin', loginUser.id);
          this.checkOnlineStatus(loginUser);
          this.updateLoggedInUser(loginUser);
          this.activeUserSubject.next(loginUser);
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
    return user = {
      id: user.id,
      mail: user.mail || googleUser?.email || '',
      username: user.username ? user.username : googleUser?.displayName || '',
      uid: user.uid || googleUser?.uid || '',
      isLoggedIn: user.isLoggedIn || true,
      activeChannels: user.activeChannels || [],
      avatar: user.avatar || '',
    };
  }


  /**
   * Updates the logged-in user's status and calls the updateUser method.
   */
  async updateLoggedInUser(loginUser?: DABubbleUser) {
    if (loginUser) {
      this.activeUser.mail = loginUser!.mail;
    }
    this.activeUser.isLoggedIn = true;
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
    if (sessionStorage.getItem('userLoginGuest')) {
      this.guestLogout();
    } else {
      let id = sessionStorage.getItem('userLogin')!;
      this.DatabaseService.updateDataInDB(this.collectionName, id, { isLoggedIn: false })
        .then(() => {
          sessionStorage.removeItem('userLogin');
          sessionStorage.removeItem('uId');
          sessionStorage.removeItem('userLogin');
          sessionStorage.removeItem('selectedChannelId');
          this.activeUserSubject.next(null!);
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
    let data: DABubbleUser = { mail: email, username: username, uid: uid, isLoggedIn: false, activeChannels: [], avatar: '/img/avatar.svg' };
    await this.DatabaseService.addDataToDB(this.collectionName, data)
      .then(() => {
        this.getUsersFromDB();
      });
  }


  /**
   * Updates a user in the database.
   * 
   * @param user - The user object to update.
   * @returns A Promise that resolves when the user is updated.
   */
  async updateUser(user: DABubbleUser) {
    await this.DatabaseService.updateDataInDB(this.collectionName, user.id!, user)
      .then(() => {
        this.activeUserSubject.next(user);
        this.getUsersFromDB();
      });
  }

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
    await this.DatabaseService.deleteDataFromDB(this.collectionName, userID)
      .then(() => { this.getUsersFromDB(); });
  }


  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user object matching the specified ID, or undefined if no user is found.
   */
  getOneUserbyId(id: string) {
    return this.users.find(user => user.id === id);
  }


  /**
   * Retrieves the channels assigned to a user.
   * 
   * @param userId - The ID of the user.
   * @returns A promise that resolves to an array of TextChannel objects.
   */
  async getUserChannels(userId: string): Promise<TextChannel[]> {
    const channelsCollectionRef = this.DatabaseService.getDataRef('channels');
    const q = query(channelsCollectionRef, where('assignedUser', 'array-contains', userId));
    const snapshot = await getDocs(q);
    const channels: TextChannel[] = [];
    snapshot.forEach(doc => channels.push(doc.data() as TextChannel));
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
    const q = query(
      usersRef,
      where('username', '>=', searchText),
      where('username', '<=', searchText + '\uf8ff')
    );

    const emailQuery = query(
      usersRef,
      where('mail', '>=', searchText),
      where('mail', '<=', searchText + '\uf8ff')
    );

    const [nameSnapshot, emailSnapshot] = await Promise.all([
      getDocs(q),
      getDocs(emailQuery)
    ]);

    const users: DABubbleUser[] = [];

    nameSnapshot.forEach(doc => {
      const data = doc.data() as DABubbleUser;
      data.id = doc.id;
      users.push(data);
    });

    emailSnapshot.forEach(doc => {
      const data = doc.data() as DABubbleUser;
      data.id = doc.id;
      if (!users.some(user => user.id === data.id)) {
        users.push(data);
      }
    });
    return users;
  }

  setSelectedUser(user: DABubbleUser | null) {
    this.selectedUserSubject.next(user);
  }

  getSelectedUser(): DABubbleUser | null {
    return this.selectedUserSubject.value;
  }

  async getDefaultUserByUid(uid: string): Promise<DABubbleUser | undefined> {
    const usersRef = collection(this.DatabaseService.firestore, this.collectionName);
    const q = query(usersRef, where('uid', '==', uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return undefined;
    } else {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as DABubbleUser;
    }
  }

  async addDefaultUserToDatabase(user: DABubbleUser): Promise<void> {
    try {
      const userRef = doc(collection(this.DatabaseService.firestore, this.collectionName));
      user.id = userRef.id;

      await setDoc(userRef, user);
    } catch (err) {
      console.error('Error adding user to DB', err);
      throw err;
    }
  }
  
}
