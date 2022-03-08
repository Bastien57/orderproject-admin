import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';

import { WoocommerceService } from 'src/app/services/woocommerce.service';

@Component({
  selector: 'app-variation',
  templateUrl: './variation.page.html',
  styleUrls: ['./variation.page.scss'],
})
export class VariationPage implements OnInit {

  @Input() idProduct: any;
  @Input() data: any;

  variation: any;

  constructor(
    private woo: WoocommerceService,
    public alertController: AlertController,
    private loadingController: LoadingController,
    public toastController: ToastController,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.variation = {
      id: this.data.id,
      sku: this.data.sku,
      regular_price: this.data.regular_price,
      attributes: this.data.attributes
    }
  }

  numberOnlyValidation(event: any) {
    const pattern = /[0-9.,]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  async closeModal(variationEdited) {
    await this.modalController.dismiss(variationEdited);
  }

  async updateVariation() {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    let data = {
      regular_price: JSON.stringify(this.variation.regular_price),
      sku: this.variation.sku
    }
    await loading.present();
    this.woo.getWooChannel().then(woo => {
      this.woo.updateVariation(woo, this.idProduct, this.variation.id, data).subscribe((variation: any) => {
        console.log(variation);
        this.presentToast("Variation modifiée 👍");
        loading.dismiss();
        this.closeModal(true);
      }, err => {
        console.log(err)
        if (err.error.code == 'product_invalid_sku') {
          this.presentToast("🚫 Référence (EAN, SKU...) non valide ou dupliqué");
          this.variation.sku = "";
        } else {
          this.presentToast("🚫 "+err.error.message);
        }
        loading.dismiss();
      })
    })
  }

  async alertDelete() {
    const alert = await this.alertController.create({
      header: "Supprimer variation",
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
            this.deleteVariation()
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteVariation() {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    this.woo.getWooChannel().then(woo => {
      this.woo.deleteVariation(woo, this.idProduct, this.variation.id).subscribe((product: any) => {
        loading.dismiss();
        this.presentToast("Variation supprimé 🗑");
        this.closeModal(true);
      }, err => {
        loading.dismiss();
        console.log(err)
        this.presentToast("🚫 "+err.error.message);
      })
    })
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      duration: 5000,
    });
    toast.present();
  }

}
