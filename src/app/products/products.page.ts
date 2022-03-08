import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonContent, LoadingController, ToastController } from '@ionic/angular';

import { DataService } from '../services/data.service';
import { WoocommerceService } from '../services/woocommerce.service';

import { Network } from '@capacitor/network';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {

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
  }

  async ionViewDidEnter() {
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

  refresh() {
    this.loadProducts()
  }

  goToProduct(product) {
    this.dataService.setData(product);
    this.router.navigateByUrl('/product');
  }

  goToCreateProduct() {
    this.router.navigateByUrl('/create-product');
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

