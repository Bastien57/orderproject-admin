import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

import { CalendarComponentOptions } from 'ion2-calendar';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {

  dateRange: { from: string; to: string };
  options: CalendarComponentOptions = {
    from: new Date(2021, 0, 1),
    pickMode: 'range',
    color: "dark",
    weekStart: 1,
    monthPickerFormat: ['JANV.', 'FÉVR.', 'MARS', 'AVR.', 'MAI', 'JUIN', 'JUIL.', 'AOÛT', 'SEPT.', 'OCT.', 'NOV.', 'DÉC.'],
    weekdays: ['D','L','M','M','J','V','S'],
  };

  constructor(
    private modalController: ModalController,
    public toastController: ToastController,
  ) { }

  ngOnInit() {
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  async getRange() {
    if (this.dateRange) {
      await this.modalController.dismiss(this.dateRange);
    } else {
      this.presentToast("🚫 Aucune période sélectionnée");
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

}
