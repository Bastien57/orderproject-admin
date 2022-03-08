import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import { DataService } from '../services/data.service'
import { WoocommerceService } from '../services/woocommerce.service';

import { Network } from '@capacitor/network';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.page.html',
  styleUrls: ['./stock.page.scss'],
})
export class StockPage implements OnInit {

  product: any;
  variations: any;

  edit: any;
  statutes = [
    {
      text: 'En stock',
      value: 'instock',
    },
    {
      text: 'En rupture',
      value: 'outofstock',
    },
    {
      text: 'En réappro',
      value: 'onbackorder',
    }
  ];
  customAlertOptions: any = {
    cssClass: 'customAlertSelect'
  };

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

  async ionViewWillEnter() {
    let networkStatus = await Network.getStatus();
    if (networkStatus.connected) {
      if (this.dataService.getData()) {
        this.loadVariations();
      } else {
        this.router.navigateByUrl('/stocks');
      }
    }
    else {
      this.presentToast("🚫 Pas de connexion internet");
    }
  }

  closeKeyboard() {
    Keyboard.hide();
  }

  async loadVariations() {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    this.product = this.dataService.getData();
    this.woo.getWooChannel().then(woo => {
      this.woo.getProductVariations(woo, this.product.id).subscribe((variations: any) => {
        this.variations = variations;
        loading.dismiss();
      });
    });
  }

  selectChanged(index, evt) {
    this.variations[index].isEdited = true;
    this.variations[index].stock_status = evt.detail.value
  };

  inputChanged(index) {
    this.variations[index].isEdited = true;
  }

  checkboxChanged(index) {
    this.variations[index].isEdited = true;
  }

  async saveStock() {
    var data = {
      "update": []
    }
    this.variations.forEach(variation => {
      if (!variation.manage_stock) {
        variation.stock_quantity = null;
      } else {
        if (variation.stock_quantity > 0) {
          variation.stock_status = 'instock';
        } else {
          variation.stock_status = 'outofstock';
        }
      }

      if (variation.isEdited) {
        data.update.push({
          id: variation.id,
          manage_stock: variation.manage_stock,
          stock_status: variation.stock_status,
          stock_quantity: variation.stock_quantity
        })
      }
    });

    if (data.update.length > 0 && 100 >= data.update.length) {
      const alert = await this.alertController.create({
        header: 'Stock modifié',
        buttons: [
          {
            text: 'ANNULER',
            role: 'cancel',
            cssClass: 'danger',
            handler: () => { }
          }, {
            text: 'VALIDER',
            cssClass: 'dark',
            handler: async () => {
              const loading = await this.loadingController.create({
                cssClass: 'loading',
              });
              await loading.present();
              this.woo.getWooChannel().then(woo => {
                this.woo.batchUpdateVariations(woo, this.product.id, data).subscribe(res => {
                  loading.dismiss();
                  this.presentToast("Stock modifié 👍");
                })
                this.variations.forEach(variation => {
                  variation.isEdited = false;
                })
              })
            }
          }
        ]
      });
      await alert.present();
    }
    else if (data.update.length == 0) {
      this.presentToast("🤔 Pas de mise à jour produits");
      this.variations.forEach(product => {
        product.isEdited = false;
      });
    }
    else {
      this.presentToast("🚫 Mise à jour limitée à 100 produits maximum.");
      this.variations.forEach(product => {
        product.isEdited = false;
      });
    }
  }

  cancelStock() {
    this.loadVariations()
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

