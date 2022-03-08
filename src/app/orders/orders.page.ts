import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, LoadingController, ToastController, IonContent } from '@ionic/angular';

import { DataService } from '../services/data.service';

import { PluginListenerHandle } from '@capacitor/core';
import { Network, ConnectionStatus } from '@capacitor/network';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

  @ViewChild(IonContent) content: IonContent;

  networkStatus: ConnectionStatus;
  networkListener: PluginListenerHandle;

  subscriptionOrdersProcessing: any;
  subscriptionOrders: any;

  limitOrdersProcessing: number;
  limitOrders: number;
  number: number = 32;
  disableInfiniteScrollProcessing: boolean = false;
  disableInfiniteScroll: boolean = false;

  segmentModel: any;
  ordersProcessing: any;
  orders: any;

  constructor(
    private router: Router,
    private dataService: DataService,
    public menu: MenuController,
    private loadingController: LoadingController,
    public toastController: ToastController,
  ) { }

  async ngOnInit() {
    this.menu.enable(true);
    this.limitOrdersProcessing = this.number;
    this.limitOrders = this.number;
    this.segmentModel = 'processing';
    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      console.log("Network status changed", status);
      this.networkStatus = status;
      if (this.networkStatus.connected) {
        this.limitOrdersProcessing = this.number;
        this.limitOrders = this.number;
        this.segmentModel = 'processing';
        this.loadOrdersProcessingAndOrders();
      } else {
        console.log('no orders')
        this.ordersProcessing = null;
        this.orders = null;
      }
    });
    this.networkStatus = await Network.getStatus();
    if (this.networkStatus.connected) {
      this.limitOrdersProcessing = this.number;
      this.limitOrders = this.number;
      this.segmentModel = 'processing';
      this.loadOrdersProcessingAndOrders();
    }
    else {
      this.presentToast("🚫 Pas de connexion internet");
    }
  }

  ngOnDestroy() {
    this.networkListener.remove();
  }

  async loadOrdersProcessingAndOrders() {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    if (this.subscriptionOrdersProcessing) {
      await this.subscriptionOrdersProcessing.unsubscribe();
    }
    this.dataService.getUID().then(uid => {
      this.subscriptionOrdersProcessing = this.dataService.getOrdersByStatus(uid, ['processing'], this.limitOrdersProcessing).subscribe(ordersProcessing => {
        this.ordersProcessing = ordersProcessing;
        this.subscriptionOrders = this.dataService.getOrdersByStatus(uid, ['pending', 'on-hold', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'trash', 'finished'/*OLD*/ ], this.limitOrders).subscribe(orders => {
          this.orders = orders;
          loading.dismiss();
        })
      })
    })
  }

  async loadMoreOrdersProcessing(event) {
    if (this.ordersProcessing.length < this.limitOrdersProcessing) {
      this.disableInfiniteScrollProcessing = true;
      this.presentToast("⚠️ Toutes les commandes en cours sont chargées");
    } else {
      this.limitOrdersProcessing = this.limitOrdersProcessing + this.number;
      const loading = await this.loadingController.create({
        cssClass: 'loading',
      });
      await loading.present();
      this.dataService.getUID().then(uid => {
        this.subscriptionOrdersProcessing = this.dataService.getOrdersByStatus(uid, ['processing'], this.limitOrdersProcessing).subscribe(ordersProcessing => {
          this.ordersProcessing = ordersProcessing;
          event.target.complete();
          loading.dismiss();
        })
      })
    }
  }

  async loadMoreOrders(event) {
    if (this.orders.length < this.limitOrders) {
      this.disableInfiniteScroll = true;
      this.presentToast("⚠️ Toutes les commandes sont chargées");
    } else {
      this.limitOrders = this.limitOrders + this.number;
      const loading = await this.loadingController.create({
        cssClass: 'loading',
      });
      await loading.present();
      this.dataService.getUID().then(uid => {
        this.subscriptionOrders = this.dataService.getOrdersByStatus(uid, ['pending', 'on-hold', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'trash', 'finished'/*OLD*/], this.limitOrders).subscribe(orders => {
          this.orders = orders;
          loading.dismiss();
          event.target.complete();
        })
      })
    }
  }

  segmentChanged(evt) {
    this.content.scrollToTop(0);
  }

  goToOrder(order) {
    this.dataService.setData(order);
    this.router.navigateByUrl('/order/');
  }

  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      duration: 5000,
    });
    toast.present();
  }

}
