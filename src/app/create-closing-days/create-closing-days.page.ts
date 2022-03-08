import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { CalendarPage } from '../modals/calendar/calendar.page';
import { WoocommerceService } from '../services/woocommerce.service';

@Component({
  selector: 'app-create-closing-days',
  templateUrl: './create-closing-days.page.html',
  styleUrls: ['./create-closing-days.page.scss'],
})
export class CreateClosingDaysPage implements OnInit {
  range: any;
  date_min: any;
  date_max: any;

  constructor(
    private router: Router,
    private woo: WoocommerceService,
    public alertController: AlertController,
    public toastController: ToastController,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
  }

  async openModalCalendar() {
    const modal = await this.modalController.create({
      component: CalendarPage,
    });
    modal.onDidDismiss().then((modelData) => {
      if (modelData.data !== undefined) {
        this.date_min = modelData.data.from;

        let date_max = new Date(modelData.data.to);
        date_max.setDate(date_max.getDate() + 1);
        this.date_max = formatDate(date_max, 'yyyy-MM-dTHH:mm:ss', 'fr');

        this.range = formatDate(modelData.data.from, 'd/M/yyyy', 'fr') +' - '+ formatDate(modelData.data.to, 'd/M/yyyy', 'fr');
      }
    });
    return await modal.present();
  }

  async getCalendar() {

    let dates;
    const exportDates = [];
    let test;
    if (this.date_min && this.date_max) {
      dates = this.getDates(this.date_min, this.date_max);
      dates.forEach((value, key) => {
        exportDates.push({
          n: formatDate(new Date(value), 'd-M-yyyy', 'fr'), 
          d: value,
          'r type': ''
        });
      });

      console.log(exportDates);

      const loading = await this.loadingController.create({
        cssClass: 'loading',
      });
      await loading.present();
      this.woo.getWooChannel().then(woo => {
        this.woo.addClosingDays(woo, exportDates).subscribe((res) => {
        console.log(res);
        loading.dismiss();
        this.router.navigateByUrl('/closing-days');
        });
      }); 

    } else {
      this.presentToast('🚫 Aucune période sélectionnée');
    }
  }


  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      duration: 3000,
      color: "dark"
    });
    toast.present();
  }

  getDates(startDate, stopDate) {
    const dateArray = new Array();
    let currentDate = formatDate(new Date(startDate), 'M-d-yyyy', 'fr');
    let dateTest = new Date(startDate);
    stopDate = formatDate(new Date(stopDate), 'M-d-yyyy', 'fr');
    while (currentDate !== stopDate) {
      dateArray.push(currentDate);
      // console.log( formatDate(date, 'yyyy/MM/dd', 'en'));
      // // console.log(formatDate(date, 'dd/MM/yyyy', 'fr'));
      dateTest.setDate( dateTest.getDate() + 1 );
      currentDate = formatDate(dateTest, 'M-d-yyyy', 'fr');
    }
    console.log(dateArray);
    return dateArray;
  }




}


