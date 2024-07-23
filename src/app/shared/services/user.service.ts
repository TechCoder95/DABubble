import { EventEmitter, Inject, Injectable } from '@angular/core';
import { DABubbleUser } from '../interfaces/user';
import { DatabaseService } from './database.service';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { JsonPipe } from '@angular/common';
import { EmailService } from './sendmail.service';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Auth, sendEmailVerification } from '@angular/fire/auth';
import { TextChannel } from '../interfaces/textchannel';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users: DABubbleUser[] = [];
  activeUser!: DABubbleUser; //Wenn du Online bist bzw eingeloogt, ist dieses Objekt immer mit dem aktuellen User gefüllt
  googleUser: User | null = null;
  guestName: string = 'Guest';
  activeUserSubject = new BehaviorSubject<DABubbleUser>(this.activeUser);
  activeUserObserver$ = this.activeUserSubject.asObservable();

  //Die Sammlung in der Datenbank, in der die Benutzer gespeichert sind
  collectionName: string = 'users';

  constructor(private DatabaseService: DatabaseService, private router: Router) {

    this.checkOnlineStatus();
    this.activeUserObserver$.subscribe((user: DABubbleUser) => {
      this.activeUser = user;
    });
  }


  /**
   * Checks the online status of the user.
   * If the user is logged in, it retrieves the user data from the database and sets the active user.
   */
  checkOnlineStatus() {
    if (sessionStorage.getItem('userLogin')) {
      let object = this.DatabaseService.readDataByID(this.collectionName, sessionStorage.getItem('userLogin')!);
      object.then((user) => {
        if (user) {
          this.activeUserSubject.next(user as DABubbleUser);
          if (this.activeUser.avatar !== '') {
            this.avatarSelected = true;
          }
        }
        else {
          this.activeUserSubject.next(null!);
        }
      });
    }
    else if (localStorage.getItem('userLogin')) {
      let object = this.DatabaseService.readDataByID(this.collectionName, localStorage.getItem('userLogin')!)
      object.then((user) => {
        if (user) {
          this.activeUserSubject.next(user as DABubbleUser);
          console.log(this);
          if (this.activeUser.avatar !== '') {
            this.avatarSelected = true;
          }
        }
        else {
          this.activeUser = null!;
          this.activeUserSubject.next(null!);
        }
      });
    }
  }


  /**
   * Retrieves users from the database.
   * @returns {Promise<void>} A promise that resolves when the users are fetched from the database.
   */
  async getUsersFromDB() {
    await this.DatabaseService.readDatafromDB(this.collectionName, this.users)
      .then(() => {
        console.log('Users fetched from DB');
      });
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
      this.writeGuestToDB().then(() => {
        this.router.navigate(['/home'])
      });
    });
  }


  /**
   * Logs in a guest user.
   * 
   * @remarks
   * This method adds a guest user to the database, retrieves the list of users from the database,
   * and performs additional operations to set the active user and navigate to the home page.
   * 
   * @returns A Promise that resolves when the guest user is logged in.
   */
  async writeGuestToDB() {
    let guestUser = { mail: this.guestName + '@' + this.guestName + '.de', username: this.guestName, uid: '', isLoggedIn: true, activated: true, avatar: '/img/4.svg' };

    await this.DatabaseService.addDataToDB(this.collectionName, guestUser)
      .then(() => {
        this.getUsersFromDB().then(() => {
          this.users.map(user => {
            if (user.username === this.guestName) {
              this.activeUserSubject.next(this.completeUser(user));
              sessionStorage.setItem('userLogin', user.id!);
              sessionStorage.setItem('selectedChannelId', user.activeChannels![0] as string);
              this.updateLoggedInUser(this.activeUser);
              console.log('Guest User Logged In');
              this.checkOnlineStatus();
              this.router.navigate(['/home']);
            }
          });
        });
      });
  }


  /**
   * Logs out the guest user.
   */
  guestLogout() {
    let id = sessionStorage.getItem('userLogin')!;
    this.DatabaseService.deleteDataFromDB(this.collectionName, id)
      .then(() => {
        sessionStorage.removeItem('userLogin'),
          this.activeUserSubject.next(null!);
        this.getUsersFromDB().then(() => {
          window.location.reload()
        });
      });
  }


  /**
   * Logs in a user with the provided email and password.
   * If the email and password match a user in the system, the user is logged in and their information is stored in local storage.
   * If the email and password do not match any user, a message is logged indicating that the user was not logged in.
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   */
  async login(googleUser: User) {
    this.getUsersFromDB().then(() => {
      let loginUser = this.users.find(user => user.mail === googleUser.email);
      if (loginUser === undefined) {
        this.DatabaseService.addDataToDB(this.collectionName, { mail: googleUser.email, isLoggedIn: true, activated: false, activeChannels: [], uid: googleUser.uid, username: googleUser.displayName, avatar: "" }).then(() => {
          this.getUsersFromDB().then(() => {
            this.users.map(user => {
              if (user.mail === googleUser.email && user.id) {
                localStorage.setItem('userLogin', user.id);
                sessionStorage.setItem('selectedChannelId', user.activeChannels![0] as string);
                this.activeUserSubject.next(this.completeUser(user, googleUser));
                this.updateLoggedInUser(this.activeUser);
                console.log('User Logged In but needs Avatar');
                this.router.navigate(['/user/chooseAvatar']);
              }
            });
          });
        });
      }
      else {
        // && user.actived === true
        if (loginUser.mail === googleUser.email && loginUser.id) {
          localStorage.setItem('userLogin', loginUser.id);
          
          sessionStorage.setItem('selectedChannelId', loginUser.activeChannels![0] as string);
          this.activeUserSubject.next(this.completeUser(loginUser, this.googleUser ? this.googleUser : googleUser));
          this.updateLoggedInUser(this.activeUser);
          this.checkOnlineStatus();
          console.log('User full Logged In');
        }
        else {
          console.log('User not logged in!');
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
   * Updates the logged-in user in the database.
   * @param {string} user The user object to update.
   * @returns A Promise that resolves when the user is updated in the database.
   */
  async updateLoggedInUser(user: DABubbleUser) {
    if (user.id) {
      this.DatabaseService.updateDataInDB(this.collectionName, user.id, { isLoggedIn: true })
        .then(() => {
          this.getUsersFromDB();
        });
    } else {
      console.error('User ID is undefined');
    }
  }

  /**
   * Updates the activation status of a user.
   * If the user has an ID, it updates the 'activated' field to true in the database.
   * After updating the status, it retrieves the updated user list from the database.
   * 
   * @param user - The user object to update.
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
   * Logs out the currently logged in user.
   * If there is a logged in user, updates the user's isLoggedIn status in the database to false
   * and removes the userLogin item from the localStorage.
   * Finally, retrieves the updated list of users from the database.
   */
  async logout() {
    if (sessionStorage.getItem('userLogin')) {
      this.guestLogout();
    }
    else {
      let id = localStorage.getItem('userLogin')!;
      this.DatabaseService.readDataByID(this.collectionName, id).then((user) => {
        this.activeUserSubject.next(user as unknown as DABubbleUser);
        if (this.activeUser.isLoggedIn === true && id) {
          this.DatabaseService.updateDataInDB(this.collectionName, id, { isLoggedIn: false })
            .then(() => {
              localStorage.removeItem('userLogin'),
                this.activeUserSubject.next(null!);
              this.getUsersFromDB().then(() => {
                window.location.reload();
              });
            });
        }
      });
    }
  }


  /**
   * Registers a new user with the provided email, password, and username.
   * 
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @param {string} username - The username of the user.
   */
  async register(email: string, username: string, uid: string) {
    let data: DABubbleUser = { mail: email, username: username, uid: uid, isLoggedIn: false, activeChannels: [], activated: false, avatar: '' };
    await this.DatabaseService.addDataToDB(this.collectionName, data)
      .then(() => {
        this.getUsersFromDB();
      }
      );
  }


  /**
   * Updates a user in the database.
   * @param {User} user - The user object to be updated.
   * @returns A Promise that resolves when the user is successfully updated.
   */
  async updateUser(user: DABubbleUser) {
    let id = localStorage.getItem('userLogin');
    if (id) {
      await this.DatabaseService.updateDataInDB(this.collectionName, id, user)
        .then(() => { this.getUsersFromDB(); });
    }
  }


  /**
   * Deletes a user from the database.
   * @param {string} userID - The ID of the user to delete.
   * @returns {Promise<void>} - A promise that resolves when the user is deleted.
   */
  async deleteUser(userID: string) {
    await this.DatabaseService.deleteDataFromDB(this.collectionName, userID)
      .then(() => { this.getUsersFromDB(); });
  }


  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user object with the specified ID, or undefined if not found.
   */
  getOneUserbyId(id: string) {
    return this.users.find(user => user.id === id);
  }


  avatarSelected: boolean = false;

  // /**
  //  * Checks if the user is currently logged in.
  //  * @returns {boolean} True if the user is logged in, false otherwise.
  //  */
  // get isLoggedIn() {
  //   if ((localStorage.getItem('userLogin') && this.activeUser) && this.avatarSelected && this.router.url != '/avatar' && this.router.url != '/addUser' ||
  //     (this.activeUser && sessionStorage.getItem('userLogin')) && this.avatarSelected && this.router.url != '/avatar' && this.router.url != '/addUser') {
  //     return true;
  //   }
  //   else
  //     return false;
  // }

}

