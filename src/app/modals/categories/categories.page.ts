import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';

import { WoocommerceService } from '../../services/woocommerce.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {

  category: any = {};
  categories: any;

  constructor(
    private woo: WoocommerceService,
    private loadingController: LoadingController,
    public toastController: ToastController,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.loadCategories();
  }

  async loadCategories() {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    this.woo.getWooChannel().then(woo => {
      this.woo.getCategories(woo).subscribe((categories: any) => {
        this.categories = categories;
        loading.dismiss()
      })
    })
  }

  async createCategory() {
    if (this.category.name) {
      const loading = await this.loadingController.create({
        cssClass: 'loading',
      });
      await loading.present();
      this.woo.getWooChannel().then(woo => {
        this.woo.createCategorie(woo, this.category).subscribe((category: any) => {
          this.presentToast("Catégorie créée 👍");
          setTimeout(() => {
            this.category = {};
            loading.dismiss();
            this.loadCategories();
          }, 500);
        })
      })
    } else {
      this.presentToast("🚫 Entrer un nom de catégorie");
    }
  }

  async closeModal(category) {
    await this.modalController.dismiss(category);
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
