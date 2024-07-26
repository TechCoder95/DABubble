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
import { collection, getDocs, query, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users: DABubbleUser[] = [];
  activeUser!: DABubbleUser;
  googleUser: User | null = null;
  guestName: string = 'Guest';
  activeUserSubject = new BehaviorSubject<DABubbleUser>(this.activeUser);
  activeUserObserver$ = this.activeUserSubject.asObservable();

  collectionName: string = 'users';

  constructor(private DatabaseService: DatabaseService, private router: Router) {
    console.log('User Service Initialized');
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
      }
    });
  }

  checkOnlineStatus(user: DABubbleUser) {
    if (user) {
      this.activeUser = user;
      this.activeUserSubject.next(user);
    } else {
      this.activeUser = null!;
      this.activeUserSubject.next(null!);
    }
  }

  async getUsersFromDB() {
    await this.DatabaseService.readDatafromDB(this.collectionName, this.users);
  }

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
          console.log('Guest User Logged In');
          this.router.navigate(['/home']);
        }
      });
    });
  }

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

  async login(googleUser: User) {
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
          console.log('User full Logged In');
        }
      }
    });
  }

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

  async updateLoggedInUser() {
    this.activeUser.isLoggedIn = true;
    this.updateUser(this.activeUser);
  }

  async updateActivationStatus(user: DABubbleUser) {
    if (user.id) {
      this.DatabaseService.updateDataInDB(this.collectionName, user.id, { activated: true })
        .then(() => {
          this.getUsersFromDB();
        });
    }
  }

  async logout() {
    if (sessionStorage.getItem('userLogin')) {
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
  }

  async register(email: string, username: string, uid: string) {
    let data: DABubbleUser = { mail: email, username: username, uid: uid, isLoggedIn: false, activeChannels: [], activated: false, avatar: '' };
    await this.DatabaseService.addDataToDB(this.collectionName, data)
      .then(() => {
        this.getUsersFromDB();
      });
  }

  async updateUser(user: DABubbleUser) {
    await this.DatabaseService.updateDataInDB(this.collectionName, user.id!, user)
      .then(() => {
        this.activeUserSubject.next(user);
        this.getUsersFromDB();
      });
  }

  async deleteUser(userID: string) {
    await this.DatabaseService.deleteDataFromDB(this.collectionName, userID)
      .then(() => { this.getUsersFromDB(); });
  }

  getOneUserbyId(id: string) {
    return this.users.find(user => user.id === id);
  }

  avatarSelected: boolean = false;

  async getUserChannels(userId: string): Promise<TextChannel[]> {
    const channelsCollectionRef = this.DatabaseService.getDataRef('channels');
    const q = query(channelsCollectionRef, where('assignedUser', 'array-contains', userId));
    const snapshot = await getDocs(q);
    const channels: TextChannel[] = [];
    snapshot.forEach(doc => channels.push(doc.data() as TextChannel));
    return channels;
  }

  async searchUsersByName(name: string): Promise<DABubbleUser[]> {
    const usersRef = collection(this.DatabaseService.firestore, this.collectionName);
    const q = query(usersRef, where('username', '==', name));
    const snapshot = await getDocs(q);
    const users: DABubbleUser[] = [];
    snapshot.forEach(doc => {
      const data = doc.data() as DABubbleUser;
      data.id = doc.id;
      users.push(data);
    });
    return users;
  }
}
