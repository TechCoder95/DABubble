import { Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';

@Injectable({
  providedIn: 'root',
})
export class DAStorageService {
  constructor() {}
  firebaseApp = getApp();
  /* firestore: Firestore = inject(Firestore); */

  /**
   * Uploads a file to the specified storage location.
   * @param file - The file to be uploaded.
   * @param name - The name of the file in the storage.
   * @returns A Promise that resolves when the file upload is complete.
   */
  async uploadFile(file: File, name: string) {
    const storage = getStorage(
      this.firebaseApp,
      'gs://dabubble-da785.appspot.com',
    );
    const mountainsRef = ref(storage, name);
    uploadBytes(mountainsRef, file).then((snapshot) => {});
    const metadata = {
      contentType: 'image/jpeg',
    };
  }

  /**
   * Downloads a file from the specified URL.
   * @param url - The URL of the file to download.
   * @returns A Promise that resolves when the file is downloaded successfully.
   */
  async downloadFile(url: string, fileName: string) {
    const storage = getStorage();
    const starsRef = ref(storage, url);

    // Get the download URL
    getDownloadURL(starsRef)
      .then((url) => {})
      .catch((error) => {
        switch (error.code) {
          case 'storage/object-not-found':
            // File doesn't exist
            break;
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;
          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
        }
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
      })
      .catch((error) => {
        // Uh-oh, an error occurred!
      });
  }

  /**
   * Uploads an image file to the specified channel.
   *
   * @param channelId - The ID of the channel where the image will be uploaded.
   * @param file - The image file to be uploaded.
   * @param fileName - The name of the image file.
   * @returns The full path of the uploaded image file.
   * @throws If there is an error uploading the file.
   */
  async uploadMessageImage(channelId: string, file: Blob, fileName: string) {
    let storage = getStorage(
      this.firebaseApp,
      'gs://dabubble-da785.appspot.com',
    );

    // Create a reference to the folder with the channelId
    let channelFolderRef = ref(storage, `channels/${channelId}`);

    // Create a reference to the file within the channel folder
    let fileRef = ref(channelFolderRef, fileName);

    // Upload the file and return URL
    try {
      let snapshot = await uploadBytes(fileRef, file);
      return snapshot.metadata.fullPath;
    } catch (error) {
      return console.error('Error uploading file: ', error);
    }
  }

  /**
   * Downloads an image from the specified URL.
   *
   * @param url - The URL of the image to download.
   * @returns The downloaded image URL.
   */
  async downloadMessageImage(url: string) {
    let storage = getStorage(
      this.firebaseApp,
      'gs://dabubble-da785.appspot.com',
    );
    let fullpath = ref(storage, url);

    let downloadedUrl = await getDownloadURL(fullpath);

    return downloadedUrl;
  }

  /**
   * Deletes an image file from the storage.
   *
   * @param url - The URL of the image file to be deleted.
   * @returns A promise that resolves when the file is deleted successfully, or rejects with an error if there was an issue deleting the file.
   */
  async deleteMessageImage(url: string) {
    let storage = getStorage(
      this.firebaseApp,
      'gs://dabubble-da785.appspot.com',
    );
    let fullpath = ref(storage, url);

    deleteObject(fullpath)
      .then(() => {
        ('FILE DELETED SUCCESSFULLY');
      })
      .catch((error) => {
        console.error('Error deleting file:', error);
      });
  }
}
