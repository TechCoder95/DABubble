import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../interfaces/chatmessage';
import { arrayUnion, arrayRemove, DocumentData } from 'firebase/firestore';
import { TextChannel } from '../interfaces/textchannel';
import { GlobalsubService } from './globalsub.service';
import { DABubbleUser } from '../interfaces/user';
import { User } from 'firebase/auth';

export interface DataId {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  firestore: Firestore = inject(Firestore);

  private onDataChange = new BehaviorSubject<any | null>(null);
  public onDataChange$ = this.onDataChange.asObservable();

  public onDomiDataChange = new BehaviorSubject<any | null>(null);
  public onDomiDataChange$ = this.onDomiDataChange.asObservable();

  constructor(private subService:GlobalsubService) {}

  /**
   * Retrieves a reference to the specified database collection.
   *
   * @param {string} collectionName - The name of the database collection.
   * @returns A reference to the specified database collection.
   */
  getDataRef(collectionName: string) {
    return collection(this.firestore, collectionName);
  }

  /**
   * Sets the reference to the specified database collection.
   *
   * @param {string} collectionName - The name of the database collection.
   * @returns A reference to the specified database collection.
   */
  setRef(collectionName: string) {
    return collection(this.firestore, collectionName);
  }

  /**
   * Reads data from the specified database and populates the provided array with the retrieved data.
   * @param {string} collectionName - The name of the database to read data from.
   * @param {any[]} array - The array to populate with the retrieved data.
   * @returns A promise that resolves when the initial data is retrieved and whenever the data changes in the database.
   */
  async readDatafromDB(collectionName: string, array: any[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      onSnapshot(
        this.getDataRef(collectionName),
        (list) => {
          const results = list.docs.map((data) => ({
            id: data.id,
            ...data.data(),
          }));
          array.length = 0;
          array.push(...results);
          resolve();
        },
        reject
      );
    }).catch((err) => {
      console.error('Error reading Data', err);
    });
  }

  /**
   * Adds data to the specified database.
   *
   * @param {string} collectionName - The name of the database.
   * @param {any} data - The data to be added to the database.
   * @returns A Promise that resolves when the data is successfully added to the database.
   */
  // async addDataToDB(collectionName: string, data: any) {
  //   await addDoc(this.setRef(collectionName), data)
  //     .catch((err) => { console.error('Error adding Data', err) })
  // }
  async addDataToDB(collectionName: string, data: any): Promise<void> {
    try {
      const docRef = await addDoc(this.setRef(collectionName), data);
    } catch (err) {
      console.error('Error adding Data', err);
      throw err;
    }
  }

  /**
   * Adds a message to a channel.
   * @param {string} channelDoc - The document ID of the channel.
   * @param {string} messageDocId - The document ID of the message.
   * @returns {Promise<void>} - A promise that resolves when the message is added to the channel.
   */
  async addMessageToChannel(channelDoc: string, messageDocId: string) {
    const channelDocRef = doc(this.firestore, 'channels', channelDoc);
    await updateDoc(channelDocRef, {
      conversationId: arrayUnion(messageDocId),
    });
  }

  /**
   * Fügt einem Nachrichten-Dokument ein Emoji hinzu.
   *
   * @param {string} messageDoc - Die ID des Nachrichten-Dokuments, dem das Emoji hinzugefügt werden soll.
   * @param {string} emojiDocId - Die ID des Emoji-Dokuments, das hinzugefügt werden soll.
   * @returns {Promise<void>} - Ein Promise, das aufgelöst wird, wenn das Emoji erfolgreich hinzugefügt wurde.
   */
  async addEmojiToMessage(
    messageDoc: string,
    emojiDocId: string
  ): Promise<void> {
    const messageDocRef = doc(this.firestore, 'messages', messageDoc);
    await updateDoc(messageDocRef, {
      emoticons: arrayUnion(emojiDocId),
    });
  }

  async removeEmojiFromMessage(
    messageDoc: string,
    emojiDocId: string
  ): Promise<void> {
    const messageDocRef = doc(this.firestore, 'messages', messageDoc);
    await updateDoc(messageDocRef, {
      emoticons: arrayRemove(emojiDocId),
    });
  }

  /**
   * Updates data in the specified database and document.
   *
   * @param {string} collectionName - The name of the database.
   * @param {string} docId - The ID of the document.
   * @param {any} data - The data to be updated.
   * @returns {Promise<void>} - A promise that resolves when the data is updated.
   */
  async updateDataInDB(collectionName: string, docId: string, data: any) {
    await updateDoc(doc(this.firestore, collectionName, docId), data).catch(
      (err) => {
        console.error('Error updating Data', err);
      }
    );
  }

  /**
   * Deletes data from the specified database and document ID.
   *
   * @param {string} collectionName - The name of the database.
   * @param {string} docId - The ID of the document to delete.
   * @returns {Promise<void>} - A promise that resolves when the data is deleted successfully.
   */
  async deleteDataFromDB(collectionName: string, docId: string) {
    await deleteDoc(doc(this.firestore, collectionName, docId)).catch((err) => {
      console.error('Error deleting Data', err);
    });
  }

  /**
   * Retrieves messages from a given channel.
   *
   * @param {string} channelName - The name of the channel.
   * @returns {Promise<ChatMessage[]>} - A promise that resolves with the list of messages.
   */
  public async getMessagesByChannel(
    channelName: string
  ): Promise<ChatMessage[]> {
    const messagesCollectionRef = this.getDataRef('messages');
    const q = query(
      messagesCollectionRef,
      where('channelId', '==', channelName)
    );
    const snapshot = await getDocs(q);
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => messages.push(doc.data() as ChatMessage));
    return messages;
  }

  /**
   * Retrieves data from a Firestore collection by ID.
   * @param collectionName - The name of the Firestore collection.
   * @param id - The ID of the document to retrieve.
   * @returns A Promise that resolves to the data of the document if it exists, or undefined if it doesn't.
   */
  public async getDatabyID(collectionName:string, where: any, userId: string) {
    const dataCollectionRef = this.getDataRef(collectionName);
    const whereis: any = where;
    const q = query(dataCollectionRef, where(whereis, '==', userId));
    const snapshot = await getDocs(q);
    const array: any[] = [];
    snapshot.forEach((doc) => array.push(doc.data()));
    return array;
  }


  /**
   * Retrieves data from a Firestore collection by ID.
   * @param collectionName - The name of the Firestore collection.
   * @param id - The ID of the document to retrieve.
   * @returns A Promise that resolves to the data of the document if it exists, or undefined if it doesn't.
   */
  async readDataByID(collectionName: string, id: string) {
    const docSnap = await getDoc(doc(this.firestore, collectionName, id));  
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  }

  /**
   * Adds channel data to the database.
   *
   * @param collectionName - The name of the collection in the database.
   * @param data - The data to be added to the database.
   * @returns A Promise that resolves to the ID of the added document.
   * @throws If there is an error adding the data to the database.
   */
  async addChannelDataToDB(collectionName: string, data: any): Promise<string> {
    try {
      const docRef = await addDoc(this.setRef(collectionName), data);
      const id = docRef.id;
      await updateDoc(docRef, { id });
      return docRef.id;
    } catch (err) {
      console.error('Error adding Data', err);
      throw err;
    }
  }

  /**
   * Retrieves the text channels assigned to a specific user.
   *
   * @param userId - The ID of the user.
   * @returns A promise that resolves to an array of TextChannel objects.
   */
  async getUserChannels(userId: string): Promise<TextChannel[]> {
    const channelsCollectionRef = this.getDataRef('channels');
    const q = query(
      channelsCollectionRef,
      where('assignedUser', 'array-contains', userId)
    );
    const snapshot = await getDocs(q);
    const channels: TextChannel[] = [];
    snapshot.forEach((doc) => channels.push(doc.data() as TextChannel));
    return channels;
  }


  async subscribeToUserData(userId: string) {
    const q = query(
      collection(this.firestore, 'users'),
      where('id', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let data = change.doc.data();
        this.subService.updateUser(data as DABubbleUser);
      });
    });
  }

  async subscribeToChannelData(channelId: string) {
    const q = query(
      collection(this.firestore, 'channels'),
      where('id', '==', channelId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let data = change.doc.data();
        this.subService.updateActiveChannel(data as TextChannel);
      });
    });
  }

  async subscribeToMessageDatainChannel(channelId: string) {
    const q = query(
      collection(this.firestore, 'messages'), where('channelId', '==', channelId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let data = change.doc.data();
        this.subService.updateAllMessages(data as ChatMessage);
      });
    });
  }

  async subscribeToThreadData(threadId: string) {
    const q = query(
      collection(this.firestore, 'threads'),
      where('id', '==', threadId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let data = change.doc.data();
        this.onDomiDataChange.next(data);
      });
    });
  }
 
}

/* async addMessageToChannel(channelDoc: string, messageDocId: string) {
  const channelDocRef = doc(this.firestore, 'channels', channelDoc);
  await updateDoc(channelDocRef, {
    conversationId: arrayUnion(messageDocId),
  });
} */
