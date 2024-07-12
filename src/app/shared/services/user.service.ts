import { Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users: User[] = [];

  //Die Sammlung in der Datenbank, in der die Benutzer gespeichert sind
  collectionName: string = 'users';

  constructor(private DatabaseService: DatabaseService) {
    this.getUsersFromDB();
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
  async login(email: string, password: string) {
    this.users.forEach((user: User) => {
      if (user.mail === email && user.password === password && user.id && user.activated) {
        localStorage.setItem('userLogin', user.id);
        this.updateLoggedInUser(user)
        console.log('User Logged In');
      }
      else {
        console.log('User not logged in!');
      }
    }
    );
  }


  /**
   * Updates the logged-in user in the database.
   * @param {string} user The user object to update.
   * @returns A Promise that resolves when the user is updated in the database.
   */
  updateLoggedInUser(user: User) {
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
  updateActivationStatus(user: User) {
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
    if (this.loggedInUser && this.loggedInUser.id) {
      this.DatabaseService.updateDataInDB(this.collectionName, this.loggedInUser.id, { isLoggedIn: false })
        .then(() => {
          localStorage.removeItem('userLogin'),
            this.getUsersFromDB();
        });
    }
  }


  /**
   * Gets the logged-in user based on the user ID stored in the local storage.
   * @returns The logged-in user object or undefined if no user is found.
   */
  get loggedInUser() {
    return this.users.find((user: User) => user.id === localStorage.getItem('userLogin'));
  }


  /**
   * Registers a new user.
   * @param {User} user - The user object to be registered.
   * @returns A promise that resolves when the user is successfully registered.
   */
  async registerUser(user: User) {
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
  async register(email: string, password: string, username: string) {
    let data = { mail: email, password: password, username: username }
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
  async updateUser(user: User) {
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

}
