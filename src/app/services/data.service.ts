import { Injectable } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AngularFirestore } from '@angular/fire/firestore';

import { Storage } from '@capacitor/storage';

import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  data: any = null;

  private authentications: Observable<any[]>;
  private orders: Observable<any[]>;

  constructor(
    private firestore: AngularFirestore
  ) {
    // this.intializeEmulator()
  }

  // intializeEmulator() {
  //   if (location.hostname === "localhost") {
  //     this.firestore.firestore.settings({
  //       host: "localhost:8080", // choose the post number specified at setup pf firestore emulator
  //       ssl: false
  //     });
  //     console.log('Database connected')
  //   }
  // }

  setData(data) {
    this.data = data;
  }

  getData() {
    return this.data;
  }

  async setUID(uid) {
    await Storage.set({
      key: 'user',
      value: JSON.stringify({
        uid: uid
      })
    });
  }

  async getUID() {
    const userStorage = await Storage.get({ key: 'user' });
    const user = JSON.parse(userStorage.value);
    return user.uid;
  }

  async setToken(token) {
    await Storage.set({
      key: 'token',
      value: JSON.stringify({
        token: token
      })
    });
  }

  async getToken() {
    const userStorage = await Storage.get({ key: 'token' });
    const user = JSON.parse(userStorage.value);
    return user.token;
  }

  getAuthentications(uid): Observable<any[]> {
    return this.authentications = this.firestore.collection('customers').doc(uid).collection('authentications').snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const idFirebase = a.payload.doc.id;
          return { idFirebase, ...data };
        });
      })
    );
  }

  saveToken(uid, token) {
    return this.firestore.collection('customers').doc(uid).update({
      token: token
    });
  }

  getOrdersByStatus(uid, status, limit): Observable<any[]> {
    return this.firestore.collection('customers').doc(uid).collection('orders', ref => ref
    .where('status', 'in', status)
    .orderBy('date', 'desc')
    .limit(limit)
    ).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const idFirebase = a.payload.doc.id;
          return { idFirebase, ...data };
        });
      })
    );
  }
  getOrder(uid, idFirebase): Observable<any> {
    return this.firestore.collection('customers').doc(uid).collection('orders').doc(idFirebase).valueChanges({ idField: "idFirebase" }).pipe(
      take(1),
      map(order => {
        return order
      })
    );
  }
  updateOrder(uid, idFirebase, data): Promise<void> {
    return this.firestore.collection('customers').doc(uid).collection<any>('orders').doc(idFirebase).update(data);
  }

}
