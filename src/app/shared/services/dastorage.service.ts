import { inject, Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";

@Injectable({
  providedIn: 'root'
})
export class DAStorageService {

  constructor() { }
  firebaseApp = getApp();
  /* firestore: Firestore = inject(Firestore); */


  /**
   * Uploads a file to the specified storage location.
   * @param file - The file to be uploaded.
   * @param name - The name of the file in the storage.
   * @returns A Promise that resolves when the file upload is complete.
   */
  async uploadFile(file: File, name: string) {
    const storage = getStorage(this.firebaseApp, "gs://dabubble-da785.appspot.com");
    const mountainsRef = ref(storage, name);
    uploadBytes(mountainsRef, file).then((snapshot) => {
    });
    const metadata = {
      contentType: 'image/jpeg',
    };
  }


  /**
   * Downloads a file from the specified URL.
   * @param url - The URL of the file to download.
   * @returns A Promise that resolves when the file is downloaded successfully.
   */
  async downloadFile(url: string) {
    const storage = getStorage();
    getDownloadURL(ref(storage, url))
      .then((url) => {
        // `url` is the download URL for 'images/stars.jpg'

        // This can be downloaded directly:
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
          const blob = xhr.response;
        };
        xhr.open('GET', url);
        xhr.send();

        // Or inserted into an <img> element
        // const img = document.getElementById('myimg');
        // img.setAttribute('src', url);
      })
      .catch((error) => {
        // Handle any errors
      });
  }


  /**
   * Deletes a file from the specified storage location.
   * @param name - The name of the file in the storage.
   * @returns A Promise that resolves when the file is deleted.
   */
  async deleteFile(url: string) {
    const storage = getStorage();

    // Create a reference to the file to delete
    const desertRef = ref(storage, url);
    // Delete the file
    deleteObject(desertRef).then(() => {
      // File deleted successfully
    }).catch((error) => {
      // Uh-oh, an error occurred!
    });
  }


  /**
   * Retrieves the download URL for a file stored in Firebase Storage.
   * @param url - The path to the file in Firebase Storage.
   * @returns A Promise that resolves to the download URL of the file.
   */
  async getDownloadURL(url: string) {
    const storage = getStorage();
    return getDownloadURL(ref(storage, url));
  }


  /**
   * Retrieves a list of prefixes and items from the storage.
   * @returns {Promise<void>} A promise that resolves when the list is retrieved successfully.
   */
  async getlist() {
    const storage = getStorage();
    // Create a reference under which you want to list
    const listRef = ref(storage, 'files/uid');
    // Find all the prefixes and items.
    listAll(listRef)
      .then((res) => {
        res.prefixes.forEach((folderRef) => {
          // All the prefixes under listRef.
          // You may call listAll() recursively on them.
        });
        res.items.forEach((itemRef) => {
          // All the items under listRef.
        });
      }).catch((error) => {
        // Uh-oh, an error occurred!
      });
  }

        async uploadMessageImage(channelId: string, file: Blob, fileName:string) {
          let storage = getStorage(this.firebaseApp, "gs://dabubble-da785.appspot.com");
        
          // Create a reference to the folder with the channelId
          let channelFolderRef = ref(storage, `channels/${channelId}`);
        
          // Create a reference to the file within the channel folder
          let fileRef = ref(channelFolderRef, fileName); 
        
          // Upload the file and return URL
          try {
            let snapshot = await uploadBytes(fileRef, file);
            return snapshot.metadata.fullPath;
          } catch (error) {
            return console.error("Error uploading file: ", error);
          }
        }

        async downloadMessageImage(channelID: string, url: string){
          let storage = getStorage(this.firebaseApp, "gs://dabubble-da785.appspot.com");
          let fullpath = ref(storage, `${url}`);
          debugger;
          console.log(fullpath);
          

          let downloadedUrl = await getDownloadURL(fullpath);
          debugger;
          console.log(downloadedUrl);
          

          return downloadedUrl;
         
      }
       
      

}
