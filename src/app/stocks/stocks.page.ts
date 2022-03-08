import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonContent, LoadingController, ToastController } from '@ionic/angular';

import { DataService } from '../services/data.service';
import { WoocommerceService } from '../services/woocommerce.service';

import { Network } from '@capacitor/network';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.page.html',
  styleUrls: ['./stocks.page.scss'],
})
export class StocksPage implements OnInit {

  @ViewChild(IonContent) content: IonContent;

  page: number;
  products: any;
  productsBackup: any;

  searchTerm = '';

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

  async ngOnInit() {
    let networkStatus = await Network.getStatus();
    if (networkStatus.connected) {
      this.loadProducts();
    }
    else {
      this.presentToast("🚫 Pas de connexion internet");
    }
  }

  closeKeyboard() {
    Keyboard.hide();
  }

  async loadProducts() {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();

    this.edit = {};

    this.woo.getWooChannel().then(woo => {
      this.woo.getProducts(woo, this.page = 1).subscribe((products: any) => {
        console.log(products)
        products.forEach(product => {
          if (product.images[0]) {
            product.image = product.images[0].src.replace(new RegExp('.jpg' + '$'), '-150x150.jpg').replace(new RegExp('.png' + '$'), '-150x150.png');
          }
        });
        this.productsBackup = products;
        this.products = products;
        loading.dismiss();
      });
    })
  }

  loadMore(event) {
    this.page++;
    if (!this.searchTerm) {
      this.woo.getWooChannel().then(woo => {
        this.woo.getProducts(woo, this.page).subscribe((products: any)  => {
          products.forEach(product => {
            if (product.images[0]) {
              product.image = product.images[0].src.replace(new RegExp('.jpg' + '$'), '-150x150.jpg');
            }
          });
          this.products = [...this.products, ...products];
          event.target.complete();
        });
      })
    } else {
      this.woo.getWooChannel().then(woo => {
        this.woo.getProductsBySearch(woo, this.searchTerm, this.page).subscribe(products => {
          products.forEach(product => {
            if (product.images[0]) {
              product.image = product.images[0].src.replace(new RegExp('.jpg' + '$'), '-150x150.jpg');
            }
          });
          this.products = [...this.products, ...products];
          event.target.complete();
        })
      })
    }
  }

  async filterList(evt) {
    this.content.scrollToTop(500);
    this.page = 1;
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    this.searchTerm = evt.srcElement.value;
    if (!this.searchTerm) {
      this.products = this.productsBackup;
      loading.dismiss();
    } else {
      this.woo.getWooChannel().then(woo => {
        this.woo.getProductsBySearch(woo, this.searchTerm, this.page = 1).subscribe(products => {
          products.forEach(product => {
            if (product.images[0]) {
              product.image = product.images[0].src.replace(new RegExp('.jpg' + '$'), '-150x150.jpg');
            }
          });
          this.products = products;
          loading.dismiss();
        })
      })
    }
  }

  selectChanged(index, evt) {
    this.products[index].isEdited = true;
    this.products[index].stock_status = evt.detail.value
  };

  inputChanged(index) {
    this.products[index].isEdited = true;
  }

  checkboxChanged(index) {
    this.products[index].isEdited = true;
  }

  async saveStock() {
    var data = {
      "update": []
    }
    this.products.forEach(product => {
      if (!product.manage_stock) {
        product.stock_quantity = null;
      } else {
        if (product.stock_quantity > 0) {
          product.stock_status = 'instock';
        } else {
          product.stock_status = 'outofstock';
        }
      }

      if (product.isEdited) {
        data.update.push({
          id: product.id,
          manage_stock: product.manage_stock,
          stock_status: product.stock_status,
          stock_quantity: product.stock_quantity
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
                this.woo.batchUpdateProducts(woo, data).subscribe(res => {
                  loading.dismiss();
                  this.presentToast("Stock modifié 👍");
                })
                this.products.forEach(product => {
                  product.isEdited = false;
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
      this.products.forEach(product => {
        product.isEdited = false;
      });
    }
    else {
      this.presentToast("🚫 Mise à jour limitée à 100 produits maximum.");
      this.products.forEach(product => {
        product.isEdited = false;
      });
    }
  }

  cancelStock() {
    this.loadProducts()
  }

  refresh() {
    this.loadProducts()
  }

  goToProduct(product) {
    this.dataService.setData(product);
    this.router.navigateByUrl('/stock');
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
