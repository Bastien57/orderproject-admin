import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';

import { WoocommerceService } from 'src/app/services/woocommerce.service';

@Component({
  selector: 'app-create-variation',
  templateUrl: './create-variation.page.html',
  styleUrls: ['./create-variation.page.scss'],
})
export class CreateVariationPage implements OnInit {

  @Input() product: any;

  variation: any = {};

  constructor(
    private woo: WoocommerceService,
    public alertController: AlertController,
    private loadingController: LoadingController,
    public toastController: ToastController,
    private modalController: ModalController,
  ) { }

  ngOnInit() { }

  numberOnlyValidation(event: any) {
    const pattern = /[0-9.,]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  async createVariation(product, variation) {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    this.product.attributes[0].options.push(this.variation.name)
    let dataProduct = {
      attributes: this.product.attributes
    }
    let dataVariation = {
      regular_price: JSON.stringify(this.variation.regular_price),
      sku: this.variation.sku,
      attributes: [
        {
          id: this.product.attributes.find(item => item.variation).id,
          name: this.product.attributes.find(item => item.variation).name,
          option: this.variation.name,
        }
      ]
    }
    await loading.present();
    this.woo.getWooChannel().then(woo => {
      this.woo.updateProduct(woo, this.product.id, dataProduct).subscribe(() => {
        this.woo.createVariation(woo, this.product.id, dataVariation).subscribe(() => {
          this.presentToast("Variation créée 👍");
          loading.dismiss();
          this.closeModal(true);
        }, err => {
          if (err.error.code == 'product_invalid_sku') {
            delete dataVariation.sku;
            this.woo.createVariation(woo, this.product.id, dataVariation).subscribe(() => {
              this.presentToastCancel("🚫 Variation créée sans référence. Référence (EAN, SKU...) non valide ou dupliqué");
              loading.dismiss();
              this.closeModal(true);
            })
          } else {
            this.presentToast("🚫 "+err.error.message);
          }
        })
      } )
    })
  }

  async closeModal(variationEdited) {
    await this.modalController.dismiss(variationEdited);
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      duration: 5000,
    });
    toast.present();
  }

  async presentToastCancel(text) {
    const toast = await this.toastController.create({
      message: text,
      buttons: [
        {
          icon: 'close',
          role: 'cancel',
          handler: () => { }
        }
      ]
    });
    toast.present();
  }

}
