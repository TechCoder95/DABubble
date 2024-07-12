import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  users: User[] = [];
  database: string = 'users';

  constructor(private DatabaseService: DatabaseService) {
    this.getUsersFromDB();
  }


  async getUsersFromDB() {
    if (this.users.length > 0) {
      this.users = []
      console.log('Array Cleared')
    }
    this.DatabaseService.readDatafromDB(this.database, this.users)
      .then(() => {
        setTimeout(() => {
          console.log(this.users)
        }, 1000);
      });
  }


  async login(email: string, password: string) {
    this.users.forEach((user: User) => {
      if (user.mail === email && user.password === password) {
        localStorage.setItem('userLogin', user.id);
        this.DatabaseService.updateDataInDB(this.database, user.id, { isLoggedIn: true })
          .then(() => {
            this.getUsersFromDB();
          });
        console.log('User Logged In');
      }
      else {
        console.log('User not logged in!');
      }
    }
    );
  }


  async logout() {
    if (this.loggedInUser) {

      this.DatabaseService.updateDataInDB(this.database, this.loggedInUser.id, { isLoggedIn: false })
        .then(() => {
          localStorage.removeItem('userLogin'),
            this.getUsersFromDB();
        });
      console.log('User Logged Out');
    }
  }


  async register(email: string, password: string, username: string) {
    let data = { mail: email, password: password, username: username }
    this.DatabaseService.addDataToDB(this.database, data)
      .then(() => {
        this.getUsersFromDB();
      });
  }


  async updateUser(user: User) {
    this.DatabaseService.updateDataInDB(this.database, user.id, user)
      .then(() => {
        this.getUsersFromDB();
      });
  }


  async deleteUser(userID: string) {
    this.DatabaseService.deleteDataFromDB(this.database, userID)
      .then(() => {
        this.getUsersFromDB();
      });
  }


  get loggedInUser() {
    return this.users.find(user => user.id === localStorage.getItem('userLogin') && user.isLoggedIn === true);
  }


}
