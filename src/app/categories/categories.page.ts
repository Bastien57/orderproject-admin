import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import { WoocommerceService } from '../services/woocommerce.service';

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
    public alertController: AlertController,
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
        console.log(this.categories)
        loading.dismiss()
      })
    })
  }

  refresh() {
    this.loadCategories()
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

  async alertDeleteCategorie(categorie, index) {
    const alert = await this.alertController.create({
      header: 'Supprimer catégorie',
      message: categorie.name,
      buttons: [
        {
          text: 'ANNULER',
          role: 'cancel',
          handler: () => { }
        }, {
          text: 'VALIDER',
          handler: () => {
            this.deleteCategory(categorie, index)
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteCategory(categorie, index) {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    this.woo.getWooChannel().then(woo => {
      this.woo.deleteCategory(woo, categorie.id).subscribe((categories: any) => {
        loading.dismiss();
        this.presentToast("Catégorie supprimée 🗑");
        delete this.categories[index]
        this.categories.splice(index,1)
      })
    })
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
