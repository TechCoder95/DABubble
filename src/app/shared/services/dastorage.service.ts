import { Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes } from "firebase/storage";

@Injectable({
  providedIn: 'root'
})
export class DAStorageService {

  constructor() { }
  firebaseApp = getApp();


  async uploadFile(file: File, name: string) {
    const storage = getStorage(this.firebaseApp, "gs://dabubble-da785.appspot.com");

    const mountainsRef = ref(storage, name);

    uploadBytes(mountainsRef, file).then((snapshot) => {
      console.log(snapshot);
      console.log('Uploaded a blob or file!');
    }); 
    const metadata = {
      contentType: 'image/jpeg',
    };


    
  }
}
