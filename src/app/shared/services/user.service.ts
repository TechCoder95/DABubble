import { Injectable } from '@angular/core';
import { DABubbleUser } from '../interfaces/user';
import { DatabaseService } from './database.service';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TextChannel } from '../interfaces/textchannel';
import { collection, getDocs, query, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users: DABubbleUser[] = [];
  activeUser!: DABubbleUser;
  googleUser!: User;
  guestName: string = 'Guest';
  activeUserSubject = new BehaviorSubject<DABubbleUser>(this.activeUser);
  activeUserObserver$ = this.activeUserSubject.asObservable();


  activeGoogleUserSubject = new BehaviorSubject<User>(this.googleUser);
  activeGoogleUserObserver$ = this.activeGoogleUserSubject.asObservable();



  avatarSelected: boolean = false;

  collectionName: string = 'users';

  constructor(private DatabaseService: DatabaseService, private router: Router) {
    // console.log('User Service Initialized');
    this.getUsersFromDB().then(() => {
      if (sessionStorage.getItem('userLogin')) {
        this.activeUser = this.users.find(user => user.id === sessionStorage.getItem('userLogin')!)!;
        this.activeUserSubject.next(this.activeUser);
        this.DatabaseService.subscribeToData(this.collectionName, this.activeUser.id!);
        this.DatabaseService.onDomiDataChange$.subscribe((data) => {
          this.activeUserSubject.next(data);
        });
      }
      else if (localStorage.getItem('userLogin')) {
        this.activeUser = this.users.find(user => user.id === localStorage.getItem('userLogin')!)!;
        this.activeUserSubject.next(this.activeUser);
        this.DatabaseService.subscribeToData(this.collectionName, this.activeUser.id!);
        this.DatabaseService.onDomiDataChange$.subscribe((data) => {
          this.activeUserSubject.next(data);
        });
        this.activeGoogleUserObserver$.subscribe((googleUser) => {
          if (googleUser) {
            this.googleUser = googleUser;
            console.log(this.googleUser.email);
          }
          else {

            if (localStorage.getItem('firebase:authUser:AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE:[DEFAULT]')) {
              let user = localStorage.getItem('firebase:authUser:AIzaSyATFKQ4Vj02MYPl-YDAHzuLb-LYeBwORiE:[DEFAULT]');

              this.googleUser = JSON.parse(user!);
              console.log('Google User: ');
              console.log(this.googleUser);
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
    let guestUser: DABubbleUser = { mail: this.guestName + '@' + this.guestName + '.de', username: this.guestName, uid: '', isLoggedIn: true, activated: true, avatar: '/img/4.svg', activeChannels: [] };

    this.DatabaseService.addDataToDB(this.collectionName, guestUser);
    this.getUsersFromDB().then(() => {
      this.users.map(user => {
        if (user.mail === guestUser.mail && user.id) {
          this.activeUser = user;
          this.activeUserSubject.next(this.completeUser(this.activeUser));
          sessionStorage.setItem('userLogin', this.activeUser.id!);
          sessionStorage.setItem('selectedChannelId', this.activeUser.activeChannels![0] as string);
          this.updateLoggedInUser();
          this.checkOnlineStatus(this.activeUser);
          // console.log('Guest User Logged In');
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
    let id = sessionStorage.getItem('userLogin')!;
    this.activeUser = null!;
    this.DatabaseService.deleteDataFromDB(this.collectionName, id)
      .then(() => {
        sessionStorage.removeItem('userLogin');
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
      let loginUser = this.users.find(user => user.mail === googleUser.email);

      if (loginUser === undefined) {
        this.DatabaseService.addDataToDB(this.collectionName, { mail: googleUser.email, isLoggedIn: false, activated: googleUser.emailVerified, activeChannels: [], uid: googleUser.uid, username: googleUser.displayName, avatar: "" }).then(() => {
          this.getUsersFromDB().then(() => {
            this.users.map(user => {
              if (user.mail === googleUser.email && user.id) {
                localStorage.setItem('userLogin', user.id);
                sessionStorage.setItem('selectedChannelId', user.activeChannels![0] as string);
                this.activeUserSubject.next(this.completeUser(user, googleUser));
                this.updateLoggedInUser();
                this.router.navigate(['/user/chooseAvatar']);
              }
            });
          });
        });
      } else {
        if (loginUser.mail === googleUser.email && loginUser.id) {
          localStorage.setItem('userLogin', loginUser.id);
          sessionStorage.setItem('selectedChannelId', loginUser.activeChannels![0] as string);
          this.checkOnlineStatus(loginUser);
          this.updateLoggedInUser();
          this.activeUserSubject.next(loginUser);
          // console.log('User full Logged In');
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
      activated: googleUser?.emailVerified || false,
      activeChannels: user.activeChannels || [],
      avatar: user.avatar || '',
    };
  }


  /**
   * Updates the logged-in user's status and calls the updateUser method.
   */
  async updateLoggedInUser() {
    this.activeUser.isLoggedIn = true;
    this.updateUser(this.activeUser);
  }


  /**
   * Updates the activation status of a user.
   * @param user - The user object to update.
   * @returns A Promise that resolves when the activation status is updated.
   */
  async updateActivationStatus(user: DABubbleUser) {
    if (user.id) {
      this.DatabaseService.updateDataInDB(this.collectionName, user.id, { activated: true })
        .then(() => {
          this.getUsersFromDB();
        });
    }
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
      this.guestLogout();
    } else {
      let id = localStorage.getItem('userLogin')!;
      this.DatabaseService.updateDataInDB(this.collectionName, id, { isLoggedIn: false })
        .then(() => {
          localStorage.removeItem('userLogin');
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
    let data: DABubbleUser = { mail: email, username: username, uid: uid, isLoggedIn: false, activeChannels: [], activated: false, avatar: '' };
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







}
