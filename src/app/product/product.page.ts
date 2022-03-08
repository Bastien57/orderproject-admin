import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonContent, LoadingController, ModalController, ToastController } from '@ionic/angular';

import { DataService } from '../services/data.service'
import { WoocommerceService } from '../services/woocommerce.service';
import { StorageService } from '../services/storage.service';

import { CategoriesPage } from '../modals/categories/categories.page';
import { ImagePage } from '../modals/image/image.page';
import { VariationPage } from '../modals/variation/variation.page';
import { CreateVariationPage } from '../modals/create-variation/create-variation.page';

import { Network } from '@capacitor/network';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {

  @ViewChild(IonContent) content: IonContent;

  product: any = {};
  variations: any = [];
  category: any = {};
  attributes: any = [];

  images: any = [];
  imagesEdited: boolean = false;

  scrollToBottom: boolean = false;

  constructor(
    private router: Router,
    private dataService: DataService,
    private storage: StorageService,
    private woo: WoocommerceService,
    public alertController: AlertController,
    public modalController : ModalController,
    public toastController: ToastController,
    private loadingController: LoadingController,
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    let networkStatus = await Network.getStatus();
    if (networkStatus.connected) {
      if (this.dataService.getData()) {
        this.loadProduct();
      } else {
        this.router.navigateByUrl('/products');
      }
    }
    else {
      this.presentToast("🚫 Pas de connexion internet");
    }
  }

  async loadProduct() {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    this.product = this.dataService.getData();
    this.product.short_description = this.product.short_description.replace(/<[^>]*>/g, '').replace(/(?:\r\n|\r|\n)/g, ''); // Replace HTML & return to line
    this.product.regular_price = Number(this.product.regular_price)
    this.category = this.product.categories[0];
    this.product.images.forEach(image => {
      this.images.push(image.src)
    });
    this.attributes = this.product.attributes;
    if (this.product.variations.length > 0) {
      loading.dismiss();
      this.loadVariations()
    } else {
      loading.dismiss();
    }
    console.log(this.product)
  }

  async loadVariations() {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    this.woo.getWooChannel().then(woo => {
      this.woo.getProductVariations(woo, this.product.id).subscribe(variations => {
        this.variations = variations
        console.log(this.variations)
        loading.dismiss();
        if (this.scrollToBottom) {
          setTimeout(() => {
            this.content.scrollToBottom(250);
            this.scrollToBottom = false;
          }, 250);
        }
      });
    });
  }

  numberOnlyValidation(event: any) {
    const pattern = /[0-9.,]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  removeImage(index) {
    console.log(this.images)
    this.images.splice(index,1);
    this.imagesEdited = true;
    console.log(this.images)
  }

  inputChanged(event) {
    if (!event.detail.value) {
      this.category = {};
    }
  }

  async openModalImage() {
    const modal = await this.modalController.create({
      component: ImagePage,
    });
    modal.onDidDismiss().then(async (modelData) => {
      if (modelData.data) {
        this.images.push(modelData.data.croppedImage.base64);
        this.imagesEdited = true;
        console.log(this.images);
      }
    });
    return await modal.present();
  }

  async openModalCategories() {
    const modal = await this.modalController.create({
      component: CategoriesPage,
    });
    modal.onDidDismiss().then(async (modelData) => {
      if (modelData.data) {
        this.category = modelData.data
      }
    });
    return await modal.present();
  }

  async openModalVariation(idProduct, variation) {
    const modal = await this.modalController.create({
      component: VariationPage,
      componentProps: {
        idProduct: idProduct,
        data: variation
      }
    });
    modal.onDidDismiss().then(async (modelData) => {
      if (modelData.data) {
        this.loadVariations()
      }
    });
    return await modal.present();
  }

  async openModalCreateVariation(product) {
    const modal = await this.modalController.create({
      component: CreateVariationPage,
      componentProps: {
        product: product
      }
    });
    modal.onDidDismiss().then(async (modelData) => {
      if (modelData.data) {
        this.loadVariations();
        this.scrollToBottom = true;
      }
    });
    return await modal.present();
  }

  async uploadFiles() {
    let imagesToUpload = [];
    let imagesExisted = [];
    this.images.forEach(image => {
      if (image.slice(0,4) != 'http') {
        imagesToUpload.push(image)
      } else {
        imagesExisted.push(image)
      }
    });
    if (imagesToUpload.length > 0) {
      const loading = await this.loadingController.create({
        cssClass: 'loading',
      });
      await loading.present();
      let allPromises = [];
      imagesToUpload.forEach(imageToUpload => {
        allPromises.push(this.storage.uploadFile(imageToUpload))
      });
      Promise.all(allPromises)
      .then(imagesTemp => {
        console.log('All images uploaded');
        loading.dismiss();
        this.updateProduct(imagesExisted, imagesTemp);
      })
      .catch(error => {
        console.log(error)
      });
    } else {
      console.log('No images');
      this.updateProduct(imagesExisted, null);
    }
  }

  async updateProduct(imagesExisted, imagesTemp) {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    // PRODUIT SIMPLE & VARIABLE
    let data: any = {
      name: this.product.name,
      short_description: this.product.short_description,
      categories: [{
        id: this.category.id
      }],
      attributes: this.attributes
    }
    if (this.imagesEdited) {
      data.images = [];
      if (imagesExisted.length > 0 || imagesTemp) {
        if (imagesTemp) {
          data.images = [];
          imagesExisted.concat(imagesTemp).forEach(image => {
            data.images.push({
              src : image
            })
          });
        } else {
          imagesExisted.forEach(image => {
            data.images.push({
              src : image
            })
          });
        }
      }
    }

    // PRODUIT SIMPLE
    if (this.product.type == 'simple') {
      data.regular_price = JSON.stringify(this.product.regular_price);
      data.sku = this.product.sku
    }

    this.woo.getWooChannel().then(woo => {
      this.woo.updateProduct(woo, this.product.id, data).subscribe((product: any) => {
        this.presentToast("Produit modifié 👍");
        setTimeout(() => {
          loading.dismiss();
          this.deleteImagesTemp(imagesTemp)
        }, 500);
      }, err => {
        console.log(err)
        if (err.error.code == 'product_invalid_sku') {
          this.presentToast("🚫 Référence (EAN, SKU...) non valide ou dupliqué");
        } else {
          this.presentToast("🚫 "+err.error.message);
        }
        loading.dismiss();
      })
    })
  }

  deleteImagesTemp(imagesTemp) {
    if (imagesTemp) {
      let allPromises = [];
      imagesTemp.forEach(imageTemp => {
        allPromises.push(this.storage.deleteFile(imageTemp))
      });
      Promise.all(allPromises)
      .then(() => {
        console.log('All images deleted');
        this.router.navigateByUrl('/products');
      })
      .catch(error => {
        console.log(error)
      });
    } else {
      console.log('No images');
      this.router.navigateByUrl('/products');
    }
  }

  async alertDelete() {
    let message;
    if (this.product.type == "variable") {
      message = "avec ces variations"
    }
    const alert = await this.alertController.create({
      header: "Supprimer produit",
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
            this.deleteProduct()
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteProduct() {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    this.woo.getWooChannel().then(woo => {
      this.woo.deleteProduct(woo, this.product.id).subscribe((product: any) => {
        loading.dismiss();
        this.presentToast("Produit supprimé 🗑");
        this.router.navigateByUrl('/products');
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
