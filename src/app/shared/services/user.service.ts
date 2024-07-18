import { EventEmitter, Injectable } from '@angular/core';
import { DABubbleUser } from '../interfaces/user';
import { DatabaseService } from './database.service';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users: DABubbleUser[] = [];
  activeUser!: DABubbleUser;
  googleUser: User | null = null;

  testUser$: EventEmitter<DABubbleUser> = new EventEmitter<DABubbleUser>();

  //Die Sammlung in der Datenbank, in der die Benutzer gespeichert sind
  collectionName: string = 'users';

  constructor(private DatabaseService: DatabaseService, private router: Router) {

    this.checkOnlineStatus();
  }

  /**
   * Checks the online status of the user.
   * If the user is logged in, it retrieves the user data from the database and sets the active user.
   */
  checkOnlineStatus() {
    if (localStorage.getItem('userLogin')) {
      let object = this.DatabaseService.readDataByID(this.collectionName, localStorage.getItem('userLogin')!)
      object.then((user) => {
        if (user) {
          this.activeUser = user as DABubbleUser;
          this.testUser$.emit(this.activeUser);
        }
        else {
          this.activeUser = null!;
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
                this.activeUser = this.completeUser(user, googleUser);
                this.updateLoggedInUser(this.activeUser);
                console.log('User Logged In');
                this.router.navigate(['/avatar']);
              }
            });
          });
        });
      }
      else {
        // && user.actived === true
        if (loginUser.mail === googleUser.email && loginUser.id) {
          localStorage.setItem('userLogin', loginUser.id);
          this.activeUser = this.completeUser(loginUser, this.googleUser);
          this.updateLoggedInUser(this.activeUser);
          console.log('User Logged In');

        }
        else {
          console.log('User not logged in!');
        }
      }


    });
  }



  completeUser(user: DABubbleUser, googleUser: any) {
    return user = {
      id: user.id,
      mail: user.mail || googleUser.email || '',
      username: user.username ? user.username : googleUser.displayName || '',
      uid: user.uid || googleUser.uid || '',
      isLoggedIn: user.isLoggedIn || true,
      activated: user.activated || false,
      activeChannels: user.activeChannels || [],
      avatar: user.avatar || '',
    };
  }


  /**
   * Updates the logged-in user in the database.
   * @param {string} user The user object to update.
   * @returns A Promise that resolves when the user is updated in the database.
   */
  updateLoggedInUser(user: DABubbleUser) {
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
  updateActivationStatus(user: DABubbleUser) {
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
    let id = localStorage.getItem('userLogin')!;
    this.DatabaseService.readDataByID(this.collectionName, id).then((user) => {
      this.activeUser = user as unknown as DABubbleUser;
      if (this.activeUser.isLoggedIn === true && id) {
        this.DatabaseService.updateDataInDB(this.collectionName, id, { isLoggedIn: false })
          .then(() => {
            localStorage.removeItem('userLogin'),
              this.activeUser = null!;
            this.getUsersFromDB();
          });
      }
    });





  }


  /**
   * Gets the logged-in user based on the user ID stored in the local storage.
   * @returns The logged-in user object or undefined if no user is found.
   */
  get loggedInUser() {
    let id = localStorage.getItem('userLogin');
    if (id) {
      return this.users.find(user => user.id === id);
    }
    return
  }


  /**
   * Registers a new user.
   * @param {User} user - The user object to be registered.
   * @returns A promise that resolves when the user is successfully registered.
   */
  async registerUser(user: DABubbleUser) {
    await this.DatabaseService.addDataToDB(this.collectionName, user)
      .then(() => {
        this.getUsersFromDB();
      });
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
      });
  }


  /**
   * Updates a user in the database.
   * @param {User} user - The user object to be updated.
   * @returns A Promise that resolves when the user is successfully updated.
   */
  async updateUser(user: DABubbleUser) {
    if (user.id) {
      await this.DatabaseService.updateDataInDB(this.collectionName, user.id, user)
        .then(() => {
          this.getUsersFromDB();
        });
    }
  }


  /**
   * Deletes a user from the database.
   * @param {string} userID - The ID of the user to delete.
   * @returns {Promise<void>} - A promise that resolves when the user is deleted.
   */
  async deleteUser(userID: string) {
    await this.DatabaseService.deleteDataFromDB(this.collectionName, userID)
      .then(() => {
        this.getUsersFromDB();
      });
  }


  /**
   * Retrieves a user by their ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user object with the specified ID, or undefined if not found.
   */
  getOneUserbyId(id: string) {
    return this.users.find(user => user.id === id);

  }

  get isLoggedIn() {
    if (localStorage.getItem('userLogin') && this.activeUser && localStorage.getItem('uId') ) {
      return true;
    }
    else {
      return false;
    }
  }

 

}
