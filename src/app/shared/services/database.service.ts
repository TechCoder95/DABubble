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
import { arrayUnion, arrayRemove } from 'firebase/firestore';
import { TextChannel } from '../interfaces/textchannel';
import { GlobalsubService } from './globalsub.service';
import { DABubbleUser } from '../interfaces/user';
import { User } from 'firebase/auth';
import { ThreadMessage } from '../interfaces/threadmessage';
import { Emoji } from '../interfaces/emoji';

export interface DataId {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  firestore: Firestore = inject(Firestore);

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
  async addDataToDB(collectionName: string, data: any) {
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
  async readDataByID(collectionName: string, id: string) {
    const docSnap = await getDoc(doc(this.firestore, collectionName, id));  
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  }

  
  async readDataByField(collectionName: string, field: string, value: string) {
    const q = query(
      collection(this.firestore, collectionName),
      where(field, '==', value)
    );
    const snapshot = await getDocs(q);
    const data: any[] = [];
    snapshot.forEach((doc) => data.push(doc.data()));
    return data;
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
      where(
        'id',
        '==',
        channel?.id || sessionStorage.getItem('selectedChannelId')
      )
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let data = change.doc.data();
        this.onDataChange.next(data);
      });
    });
  }

  /**
   * Subscribes to data changes in a specific collection and with a specific data ID.
   * @param collectionName - The name of the collection to subscribe to.
   * @param dataId - The ID of the data to subscribe to.
   */
  async subscribeToData(collectionName: string, dataId: string) {
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

  async subscribeToEmojisofMessage(messageId: string) {
    const q = query(
      collection(this.firestore, 'emojies'), where('messageId', '==', messageId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let data = change.doc.data();
          this.subService.updateEmoji(data as Emoji);
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
        this.subService.updateActiveThread(data as ThreadMessage);
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
