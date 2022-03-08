import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import { DataService } from '../services/data.service'
import { WoocommerceService } from '../services/woocommerce.service';

import { Network } from '@capacitor/network';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {

  idFirebase: any;

  order: any;
  products: any;

  dataToFirebase: any;
  dataToWoo: any;

  constructor(
    private activatedRoute: ActivatedRoute,
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
      this.activatedRoute.paramMap.subscribe(params => {
        this.idFirebase = params.get('idFirebase');
        this.loadOrder(this.idFirebase);
      })
    }
    else {
      this.presentToast("🚫 Pas de connexion internet");
    }
  }

  async loadOrder(idFirebase) {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    if (this.idFirebase) {
      this.dataService.getUID().then(uid => {
        this.dataService.getOrder(uid, idFirebase).subscribe(order => {
          this.order = order;
          this.loadImages();
          loading.dismiss();
        })
      })
    } else {
      if (this.dataService.getData()) {
        this.order = this.dataService.getData();
        this.loadImages();
        loading.dismiss();
      } else {
        this.router.navigateByUrl('/orders');
        loading.dismiss();
      }
    }
  }

  loadImages() {
    let idsProducts = [];
    this.order.line_items.forEach(item => {
      idsProducts.push(item.product_id);
    });

    let idsProductsFiltered = idsProducts.filter((value, index) => idsProducts.indexOf(value) === index); // How to Remove Array Duplicates (Other solution : let idsProductsFiltered = [...new Set(idsProducts)])
    
    this.woo.getWooChannel().then(woo => {
      this.woo.getProductsByIds(woo, idsProductsFiltered).subscribe((products: any) => {
        this.products = products;
        this.order.line_items.forEach(item => {
          let product = products.find(product => product.id === item.product_id);
          if (product.images.length > 0) {
            item.image = product.images[0].src.replace(new RegExp('.jpg' + '$'), '-150x150.jpg').replace(new RegExp('.png' + '$'), '-150x150.png');
          }
        });
      });
    });
  }

  // isValid(value) {
  //   if (typeof value == 'string' && !value.includes("_")) {
  //     return value.replace('<br/>',' ')
  //   }
  // }

  async alertChangeStatus(order) {
    let pendingChecked = false;
    let onHoldChecked = false;
    let processingChecked = false;
    let completedChecked = false;
    let failedChecked = false;
    let cancelledChecked = false;
    
    if (order.status == 'pending') {
      pendingChecked = true
    }
    else if (order.status == 'on-hold') {
      onHoldChecked = true;
    }
    else if (order.status == 'processing') {
      processingChecked = true;
    }
    else if (order.status == 'completed') {
      completedChecked = true;
    }
    // OLD
    else if (order.status == 'finished') {
      completedChecked = true;
    }
    else if (order.status == 'failed') {
      failedChecked = true;
    }
    else if (order.status == 'cancelled') {
      cancelledChecked = true;
    }
    

    const alert = await this.alertController.create({
      header: 'Statut',
      cssClass: 'customAlertSelect',
      inputs: [
        {
          name: 'pending',
          type: 'radio',
          label: 'Attente paiement',
          value: 'pending',
          checked: pendingChecked
        },
        {
          name: 'on-hold',
          type: 'radio',
          label: 'En attente',
          value: 'on-hold',
          checked: onHoldChecked
        },
        {
          name: 'processing',
          type: 'radio',
          label: 'En cours',
          value: 'processing',
          checked: processingChecked
        },
        {
          name: 'completed',
          type: 'radio',
          label: 'Terminée',
          value: 'completed',
          checked: completedChecked
        },
        {
          name: 'failed',
          type: 'radio',
          label: 'Échouée',
          value: 'failed',
          checked: failedChecked
        },
        {
          name: 'cancelled',
          type: 'radio',
          label: 'Annulée',
          value: 'cancelled',
          checked: cancelledChecked
        }
      ],
      buttons: [
        {
          text: 'ANNULER',
          role: 'cancel',
          cssClass: 'medium',
          handler: () => { }
        }, {
          text: 'VALIDER',
          cssClass: 'bold',
          handler: (status) => {
            if (status !== order.status) {
              this.changeStatus(status)
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async changeStatus(status) {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    console.log(status)
    if (this.order.from.name == 'woocommerce') {
      let date = new Date(new Date().valueOf() - new Date().getTimezoneOffset() *60*1000).toISOString().split('.')[0];
      let date_gmt = new Date().toISOString().split('.')[0];

      this.dataToFirebase = { status: status, date_modified: date, date_modified_gmt: date_gmt };
      this.dataToWoo = { status: status, date_modified: date, date_modified_gmt: date_gmt }

      this.dataService.getUID().then(uid => {
        this.dataService.updateOrder(uid, this.order.idFirebase, this.dataToFirebase).then(() => {
          this.woo.getWooChannel().then(woo => {
            this.woo.updateOrder(woo, this.order.id, this.dataToWoo).subscribe(res => {
              this.presentToast("Statut modifié 👍");
              this.router.navigateByUrl('/orders');
              loading.dismiss();
            }, err => {
              this.presentToast("🚫 Une erreur est survenue, merci de réessayer");
              loading.dismiss();
            })
          })
        },
        err => {
          loading.dismiss();
          this.presentToast("🚫 Une erreur est survenue, merci de réessayer");
        })
      })
    }
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      duration: 5000,
    });
    toast.present();
  }

}
