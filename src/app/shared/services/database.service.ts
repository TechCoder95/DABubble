import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  // Firestore Initialization
  firestore: Firestore = inject(Firestore);
  //Variablen

  constructor() {
  }


  getDataRef(database: string) {
    return collection(this.firestore, database);
  }


  getSingleDocRef(database: string, docId: string) {
    return doc(collection(this.firestore, database), docId);
  }


  getSingleDocID(database: string) {
    return doc(collection(this.firestore, database));
  }



  setRef(database: string) {
    return collection(this.firestore, database);
  }


  getcolID(docref: any) {
    return docref.path.split('/')[1];
  }


  async readDatafromDB(database: string, array: any[]) {
    return onSnapshot(this.getDataRef(database), (list) => {
      list.docs.forEach(data => {
          array.push({ id: data.id, ...data.data() });
      });
    });
  }


  async addDataToDB(database: string, data: any) {
    await addDoc(this.setRef(database), data)
      .catch((err) => { console.error('Error adding Data', err) })
      .then(() => { console.log('Data Added') });
  }


  async updateDataInDB(database: string, docId: string, data: any) {
    await updateDoc(doc(this.firestore, database, docId), data)
      .catch((err) => { console.error('Error updating Data', err) })
      .then(() => { console.log('Data Updated') });
  }


  async deleteDataFromDB(database: string, docId: string) {
    await deleteDoc(doc(this.firestore, database, docId))
      .catch((err) => { console.error('Error deleting Data', err) })
      .then(() => { console.log('Data Deleted') });
  }

}
