import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, LoadingController, ModalController, ToastController } from '@ionic/angular';

import { WoocommerceService } from '../services/woocommerce.service';
import { StorageService } from '../services/storage.service';

import { ImagePage } from '../modals/image/image.page';
import { CategoriesPage } from '../modals/categories/categories.page';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.page.html',
  styleUrls: ['./create-product.page.scss'],
})
export class CreateProductPage implements OnInit {

  @ViewChild(IonContent) content: IonContent;

  product: any = {};
  variations: any = [];
  category: any = {};
  attributes: any = [];

  images: any = [];
  imagesTemp: any = [];

  customAlertOptions: any = {
    header: 'Type',
  };

  constructor(
    private woo: WoocommerceService,
    private storage: StorageService,
    private loadingController: LoadingController,
    public modalController : ModalController,
    public toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.product = {
      type: "simple"
    };
    this.variations = [{}];
    this.category = {};
    this.attributes = [];
    this.images = [];
    this.imagesTemp = [];
  }

  numberOnlyValidation(event: any) {
    const pattern = /[0-9.,]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  addTerm() {
    this.variations = [...this.variations, {}];
    setTimeout(() => {
      this.content.scrollToBottom(250);
    }, 250);
  }

  deleteTerm(index) {
    this.variations.splice(index,1);
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
        console.log(this.images);
      }
    });
    return await modal.present();
  }

  removeImage(index) {
    this.images.splice(index,1);
    console.log(this.images)
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

  async uploadFiles() {
    if (this.product.name) {
      if (this.images.length > 0) {
        const loading = await this.loadingController.create({
          cssClass: 'loading',
        });
        await loading.present();
        let allPromises = [];
        this.images.forEach(image => {
          allPromises.push(this.storage.uploadFile(image))
        });
        Promise.all(allPromises)
        .then(imagesTemp => {
          console.log('All images uploaded');
          loading.dismiss();
          this.createProduct(imagesTemp);
        })
        .catch(error => {
          console.log(error)
        });
      } else {
        console.log('No images');
        this.createProduct(null);
      }
    } else {
      this.presentToast("🚫 Entrer un nom de produit");
    }
  }

  async createProduct(imagesTemp) {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    // PRODUIT SIMPLE
    if (this.product.type == 'simple') {
      this.product.regular_price = JSON.stringify(this.product.regular_price);
      this.product.attributes = this.attributes;
    }
    // PRODUIT AVEC VARIATIONS
    else if (this.product.type == 'variable') {
      let variations = []
      this.variations.forEach(variation => {
        if (variation.name) {
          variations.push(variation.name)
        }
      });
      this.product.attributes = this.attributes;
      this.product.attributes.push({
        name: this.product.variable_name,
        visible: false,
        variation: true,
        options: variations
      })
    }
    // PRODUIT SIMPLE & AVEC VARIATIONS
    this.product.categories = [];
    this.product.categories.push({
      id: this.category.id
    })
    if (imagesTemp) {
      this.product.images = [];
      imagesTemp.forEach(imageTemp => {
        this.product.images.push({
          src : imageTemp
        })
      });
    }
    this.woo.getWooChannel().then(woo => {
      this.woo.createProduct(woo, this.product).subscribe(async (product: any) => {
        if (this.product.type == 'simple') {
          this.presentToast("Produit simple créé 👍");
          setTimeout(() => {
            loading.dismiss();
            this.deleteImagesTemp(imagesTemp, true)
          }, 500);
        }
        else if (this.product.type == 'variable') {
          var i = 0;
          var variationsCreated = [];
          await this.variations.reduce(async (promise, variation) => {
            await promise;
            const variationCreated = await this.createVariation(product, variation);
            if (variationCreated) {
              variationsCreated.push(variationCreated)
            }
          }, Promise.resolve());
          var products_invalidSKU = null;
          variationsCreated.forEach(variationCreated => {
            if (variationCreated.invalidSKU == true) {
              if (products_invalidSKU) {
                products_invalidSKU = products_invalidSKU +", "+variationCreated.attributes[0].option
              } else {
                products_invalidSKU = variationCreated.attributes[0].option;
              }
            }
          });
          if (products_invalidSKU) {
            this.presentToastCancel("🚫 Variation(s) "+products_invalidSKU+" créée(s) sans référence. Référence (EAN, SKU...) non valide ou dupliqué");
          } else {
            this.presentToast("Produit avec variations créé 👍");
          }
          setTimeout(() => {
            loading.dismiss();
            this.deleteImagesTemp(imagesTemp, true)
          }, 500);
        }
      }, err => {
        this.deleteImagesTemp(imagesTemp, false)
        if (err.error.code == 'product_invalid_sku') {
          this.presentToast("🚫 Référence (EAN, SKU...) non valide ou dupliqué");
        } else {
          this.presentToast("🚫 "+err.error.message);
        }
        loading.dismiss();
      })
    })
  }

  createVariation(product, variation) {
    return new Promise(resolve => {
      let data = {
        regular_price: JSON.stringify(variation.regular_price),
        sku: variation.sku,
        attributes: [
          {
            id: product.attributes.find(item => item.variation).id,
            name: product.attributes.find(item => item.variation).name,
            option: variation.name,
          }
        ]
      }
      this.woo.getWooChannel().then(woo => {
        this.woo.createVariation(woo, product.id, data).subscribe((variationCreated: any) => {
          console.log(variationCreated)
          resolve(variationCreated)
        }, err => {
          if (err.error.code == 'product_invalid_sku') {
            delete data.sku;
            this.woo.createVariation(woo, product.id, data).subscribe((variationCreatedWithoutSKU: any) => {
              console.log(variationCreatedWithoutSKU)
              variationCreatedWithoutSKU.invalidSKU = true;
              resolve(variationCreatedWithoutSKU)
            })
          } else {
            this.presentToast("🚫 "+err.error.message);
            resolve(null)
          }
        })
      })
    })
  }

  deleteImagesTemp(imagesTemp, productCreated) {
    if (imagesTemp) {
      let allPromises = [];
      imagesTemp.forEach(imageTemp => {
        allPromises.push(this.storage.deleteFile(imageTemp))
      });
      Promise.all(allPromises)
      .then(() => {
        console.log('All images deleted');
        if (productCreated) {
          this.router.navigateByUrl('/products');
        }
      })
      .catch(error => {
        console.log(error)
      });
    } else {
      console.log('No images');
      console.log(productCreated)
      if (productCreated) {
        this.router.navigateByUrl('/products');
      }
    }
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      duration: 5000,
      color: "dark"
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
