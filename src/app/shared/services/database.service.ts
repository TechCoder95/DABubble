import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, where, getDocs, getDoc } from '@angular/fire/firestore';
import { ChatMessage } from '../interfaces/chatmessage';
import { TextChannel } from '../interfaces/textchannel';
import { GlobalsubService } from './globalsub.service';
import { DABubbleUser } from '../interfaces/user';
import { ThreadMessage } from '../interfaces/threadmessage';
import { Emoji } from '../interfaces/emoji';
import { Subscription } from 'rxjs';
import { ThreadChannel } from '../interfaces/thread-channel';



@Injectable({
  providedIn: 'root',
})
export class DatabaseService implements OnDestroy {
  firestore: Firestore = inject(Firestore);
  private unsubscribe!: (() => void);

  constructor(private subService: GlobalsubService) {
    this.listenToEntityChanges('users');
  }

  listenToEntityChanges(entity: string) {
    const collectionRef = collection(this.firestore, entity);
    this.unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          //  console.log('Neues Dokument hinzugefügt:', change.doc.data());
        }
        if (change.type === 'modified') {
          this.subService.updateUserFromDatabaseChange(change.doc.data() as DABubbleUser);
          //  console.log('Dokument geändert:', change.doc.data());
        }
        if (change.type === 'removed') {
          //  console.log('Dokument entfernt:', change.doc.data());
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  /**
   * Retrieves a reference to the specified database collection.
   *
   * @param {string} collectionName - The name of the database collection.
   * @returns A reference to the specified database collection.
   */
  async getDataRef(collectionName: string) {
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


  async readDataFromDB<T>(collectionName: string): Promise<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map((doc) => doc.data() as T);
  }


  /**
   * Adds data to the specified database.
   *
   * @param {string} collectionName - The name of the database.
   * @param {any} data - The data to be added to the database.
   * @returns A Promise that resolves when the data is successfully added to the database.
   */
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
  public async getMessagesByChannel(channelName: string): Promise<ChatMessage[]> {
    const messagesCollectionRef = await this.getDataRef('messages');
    const q = query(
      messagesCollectionRef,
      where('channelId', '==', channelName)
    );
    const snapshot = await getDocs(q);
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => messages.push(doc.data() as ChatMessage));
    return messages;
  }

  public async getThreadByMessage(messageId: string): Promise<ThreadChannel | null> {
    const threadsCollectionRef = await this.getDataRef('threads');
    console.log(threadsCollectionRef);

    const q = query(
      threadsCollectionRef,
      where('messageID', '==', messageId)
    );
    console.log(messageId);
    console.log(q);

    const snapshot = await getDocs(q);
    console.log(snapshot);

    if (snapshot.size === 1) {
      const doc = snapshot.docs[0];
      const threadData = doc.data() as ThreadChannel;
      console.log(JSON.stringify(threadData, null, 2)); // Thread als lesbares Objekt ausgeben
      return threadData;
    } else {
      // Es wurde entweder kein Eintrag oder mehr als ein Eintrag gefunden
      return null;
    }
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
   * Retrieves data from a Firestore collection based on a specific field and value.
   * 
   * @param collectionName - The name of the collection to query.
   * @param field - The field to filter the data by.
   * @param value - The value to match in the specified field.
   * @returns An array of data objects that match the specified field and value.
   */
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
   * Retrieves data from a Firestore collection based on an array field value.
   * 
   * @param collectionName - The name of the Firestore collection.
   * @param field - The name of the array field to filter by.
   * @param value - The value to search for in the array field.
   * @returns An array of documents that match the specified criteria.
   */
  async readDataByArray(collectionName: string, field: string, value: string) {
    const q = query(
      collection(this.firestore, collectionName),
      where(field, 'array-contains', value)
    );
    const snapshot = await getDocs(q);
    const data: any[] = [];
    snapshot.forEach((doc) => data.push(doc.data()));
    return data;
  }


  /**
   * Deletes documents from a Firestore collection based on a specified field and value.
   * 
   * @param collectionName - The name of the collection to delete documents from.
   * @param field - The field to filter documents by.
   * @param value - The value to match against the specified field.
   * @returns A Promise that resolves when the deletion is complete.
   */
  async deleteDatabyField(collectionName: string, field: string, value: string) {
    const q = query(
      collection(this.firestore, collectionName),
      where(field, '==', value)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => deleteDoc(doc.ref));
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
   * Subscribes to user data based on the provided user ID.
   * 
   * @param userId - The ID of the user to subscribe to.
   * @returns A function to unsubscribe from the subscription.
   */
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


  /**
   * Subscribes to channel data based on the provided channelId.
   * 
   * @param channelId - The ID of the channel to subscribe to.
   * @returns A function to unsubscribe from the channel data subscription.
   */
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
   * Subscribes to message data in a specific channel.
   * 
   * @param channelId - The ID of the channel to subscribe to.
   */
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


  /**
   * Subscribes to emojis of a specific message.
   * 
   * @param messageId - The ID of the message to subscribe to.
   */
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


  /**
   * Subscribes to thread data based on the provided thread ID.
   * 
   * @param threadId - The ID of the thread to subscribe to.
   * @returns A function to unsubscribe from the thread data subscription.
   */
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