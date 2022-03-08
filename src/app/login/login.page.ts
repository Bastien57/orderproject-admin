import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, LoadingController, ToastController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { AuthService } from '../services/auth.service'
import { DataService } from '../services/data.service';
import { FcmService } from '../services/fcm.service';

import { Storage } from '@capacitor/storage';
import { Network } from '@capacitor/network';

import { takeWhile } from "rxjs/operators";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  uid: any;
  isAlive: boolean;
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fcmService: FcmService,
    public toastController: ToastController,
    private loadingController: LoadingController,
    public menu: MenuController,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
  ) { }

  ngOnInit() {
    this.menu.enable(false);
    this.loginForm = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
    });
  }

  ionViewDidLeave() {
    this.isAlive = false;
  }

  ionViewDidEnter() {
    this.isAlive = true;
  }

  async login() {

    let networkStatus = await Network.getStatus();
    if (networkStatus.connected) {
      const loading = await this.loadingController.create({
        cssClass: 'loadingLogin',
      });
      await loading.present();
      this.authService.loginUser(this.loginForm.value.email, this.loginForm.value.password)
      .then((user) => {
        this.dataService.setUID(user.user.uid);

        this.dataService.getToken().then(token => {
          this.dataService.saveToken(user.user.uid, token).then(() => {
            console.log('Token saved');
          },
          err => {
            console.log('Error: ' + JSON.stringify(err));
          })
        })

        this.dataService.getAuthentications(user.user.uid).pipe(takeWhile(() => this.isAlive)).subscribe(authentications => {
          authentications.forEach(authentication => {
            this.setChannel(authentication);
          });
          loading.dismiss();
          this.router.navigateByUrl('/orders');
          this.presentToast(`${this.loginForm.value.email} connecté avec succès ! 👍`);
          this.loginForm.reset();
        })
      })
      .catch((error) => {
        loading.dismiss();
        if (error.code === 'auth/invalid-email') {
          this.presentToastLogin('🚫 Entrer un email correct');
          this.loginForm.reset();
        } else if (error.code === 'auth/wrong-password') {
          this.presentToastLogin('🚫 Mot de passe incorrect');
          this.loginForm.reset({
            email: this.loginForm.value.email,
            password: ''
          });
        } else if (error.code === 'auth/argument-error') {
          this.presentToastLogin('🚫 Arguments incorrects');
          this.loginForm.reset();
        } else if (error.code === 'auth/user-not-found') {
          this.presentToastLogin('🚫 Aucun utilisateur trouvé');
          this.loginForm.reset();
        } else if (error.code === 'auth/too-many-requests') {
          this.presentToastLogin("🚫 Trop de tentatives de connexion infructueuses, s'il vous plaît essayer plus tard");
          this.loginForm.reset();
        } else if (error.code === 'auth/network-request-failed') {
          this.presentToastLogin("🚫 La demande a expiré, s'il vous plaît essayer à nouveau");
          this.loginForm.reset();
        } else {
          this.presentToastLogin(error.code);
          this.loginForm.reset();
        }
      })
    }
    else {
      this.presentToastLogin("🚫 Pas de connexion internet");
    }
	}

  async setChannel(authentication) {
    if (authentication.type == 'woocommerce') {
      await Storage.set({
        key: authentication.type,
        value: JSON.stringify({
          consumerKey: authentication.consumerKey,
          consumerSecret: authentication.consumerSecret,
          url: authentication.url,
          versionAPI: authentication.versionAPI
        })
      });
    }
  }

  async presentToastLogin(text) {
    const toast = await this.toastController.create({
      cssClass: 'toast-login',
      message: text,
      duration: 5000,
      color: "dark"
    });
    toast.present();
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      duration: 5000,
      color: "dark"
    });
    toast.present();
  }

}
