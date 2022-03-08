import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Platform, AlertController } from '@ionic/angular';

import { AuthService } from './services/auth.service';
import { FcmService } from './services/fcm.service';

import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  public selectedIndex = 0;
  public appPages = [
    {
      title: 'Commandes',
      url: '/orders',
      icon: 'cart'
    },
    {
      title: 'Produits',
      url: '/products',
      icon: 'albums'
    },
    {
      title: 'Catégories',
      url: '/categories',
      icon: 'folder-open'
    },
    {
      title: 'Stocks',
      url: '/stocks',
      icon: 'cube'
    },
    {
      title: 'Statistiques',
      url: '/statistics',
      icon: 'stats-chart'
    },
    {
      title: 'Jours de fermeture',
      url: '/closing-days',
      icon: 'stats-chart'
    }
  ];
  constructor(
    private platform: Platform,
    private router: Router,
    private authService: AuthService,
    private fcmService: FcmService,
    public alertController: AlertController,
  ) {
    this.initializeApp();
  }

  async initializeApp() {

    this.platform.ready().then(() => {
      // Trigger the push setup 
      this.fcmService.initPush();
    });
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Déconnexion',
      buttons: [
        {
          text: 'ANNULER',
          role: 'cancel',
          handler: () => { }
        }, {
          text: 'OK',
          handler: () => {
            this.authService.logoutUser();
            this.clearStorage();
            this.router.navigateByUrl('/orders');
            setTimeout(() => {
              location.reload();
            }, 500);
          }
        }
      ]
    });
    await alert.present();
  }

  async clearStorage() {
    await Storage.clear();
  }

}
