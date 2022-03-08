import { Injectable } from '@angular/core';

import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private angularFireStorage: AngularFireStorage
  ) { }


  async uploadFile(file) {
    const randomId = Math.random().toString(36).substring(2, 8);
    return new Promise((resolve, reject) => {
      const fileRef = this.angularFireStorage.ref(`TEMP/${new Date().getTime()}_${randomId}.jpg`);
      fileRef.putString(file, 'data_url', {
          contentType: 'image/jpeg'
        }).then(function () {
        fileRef.getDownloadURL().subscribe((url: any) => {
          resolve(url);
        });
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

  async deleteFile(fileUrl) {
    return new Promise((resolve, reject) => {
      const fileRef = this.angularFireStorage.storage.refFromURL(fileUrl).delete()
      .then(function () {
        resolve('file deleted');
      })
    });
  }


}
