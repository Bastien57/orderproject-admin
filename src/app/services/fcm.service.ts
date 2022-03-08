import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from './data.service';
 
import {
  PushNotificationSchema,
  PushNotifications,
  ActionPerformed,
  Token,
} from '@capacitor/push-notifications';

import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
 
  constructor(
    private router: Router,
    private dataService: DataService,
  ) { }
  
  initPush() {
    if (Capacitor.getPlatform() !== 'web') {
      this.registerPush();
    }
  }
 
  private registerPush() {
    PushNotifications.requestPermissions().then((permission) => {
      if (permission.receive) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // No permission for push granted
      }
    });
 
    PushNotifications.addListener(
      'registration',
      (token: Token) => {
        console.log('My token: ' + JSON.stringify(token));
        this.dataService.setToken(token.value);
      }
    );
 
    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error: ' + JSON.stringify(error));
    });
 
    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
      }
    );
 
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      async (notification: ActionPerformed) => {
        const data = notification.notification.data;
        console.log('Action performed: ' + JSON.stringify(notification.notification));
        if (data.idFirebase) {
          console.log('detailsId: ' + data.idFirebase)
          this.router.navigateByUrl(`/order/${data.idFirebase}`);
        }
      }
    );
  }

}