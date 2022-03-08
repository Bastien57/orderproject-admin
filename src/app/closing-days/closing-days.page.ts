import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { DataService } from '../services/data.service';
import { WoocommerceService } from '../services/woocommerce.service';

@Component({
  selector: 'app-closing-days',
  templateUrl: './closing-days.page.html',
  styleUrls: ['./closing-days.page.scss'],
})
export class ClosingDaysPage implements OnInit {

  closingdays:any;
  datenow: any = Date.now();

  constructor(    
    private router: Router,
    private dataService: DataService,
    private woo: WoocommerceService,
    private loadingController: LoadingController,
    public toastController: ToastController,
    public alertController: AlertController,
    ) { }

  ngOnInit() {
  }

  async ionViewDidEnter() {
    let networkStatus = await Network.getStatus();
    if (networkStatus.connected) {
      this.loadClosingDays();
    }
    else {
      this.presentToast("🚫 Pas de connexion internet");
    }
  }

  async loadClosingDays() {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();

    this.woo.getWooChannel().then(woo => {
      this.woo.getClosingDays(woo).subscribe( (res: any) => {

        this.closingdays = res.data;
        console.log(this.closingdays);
        loading.dismiss();
      });
    })
  }

  goToCreateClosingDays() {
    this.router.navigateByUrl('/create-closing-days');
  }

  refresh() {
    this.loadClosingDays()
  }

  removeClosingDay(res){
    this.woo.getWooChannel().then(woo => {
      this.woo.removeClosingDays(woo, res).subscribe((res: any) => {
        console.log(res);
        this.refresh();
      });
    });
  }

  async alertDelete(res) {
    let message;
    console.log(res);
    const alert = await this.alertController.create({
      header: "Supprimer le jour de fermeture",
      message: message,
      buttons: [
        {
          text: 'ANNULER',
          role: 'cancel',
          cssClass: 'danger',
          handler: () => { }
        }, {
          text: 'VALIDER',
          cssClass: 'dark',
          handler: () => {
            this.removeClosingDay(res)
          }
        }
      ]
    });
    await alert.present();
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
