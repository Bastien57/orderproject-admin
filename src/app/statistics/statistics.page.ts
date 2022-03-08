import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import { formatDate } from '@angular/common';

import { WoocommerceService } from '../services/woocommerce.service';

import { ChartDataSets } from 'chart.js'
import { Color, Label } from 'ng2-charts';

import { Network } from '@capacitor/network';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
})
export class StatisticsPage implements OnInit {

  report: any;
  segmentModel = 'week';

  date_min: any;
  date_max: any;

  // Chart
  chartData: ChartDataSets[] = [{ data: []}];
  chartLabels: Label[];
  chartOptions = {
    responsive: true,
    pan: {
      enabled: true,
      mode: 'xy'
    },
    animation: {
      duration: 0
    },
    scales: {
      yAxes: [{
        ticks: {
          callback: function(value, index, values) {
            return value.toLocaleString("fr-FR",{style:"currency", currency:"EUR"});
          }
        }
      }]
    }
  };
  chartColors: Color[] = [
    {
      borderColor: 'rgba(252,121,120)',
      backgroundColor: 'rgba(252,121,120, 0.3)'
    }
  ];
  chartType = 'line';
  showLegend = false;

  constructor(
    private woo: WoocommerceService,
    private loadingController: LoadingController,
    public alertController: AlertController,
    public toastController: ToastController,
  ) { }

  async ngOnInit() {
    let networkStatus = await Network.getStatus();
    if (networkStatus.connected) {
      this.loadReport(this.segmentModel);
    }
    else {
      this.presentToast("🚫 Pas de connexion internet");
    }
  }

  async loadReport(segmentModel) {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    this.woo.getWooChannel().then(woo => {
      this.woo.getSalesReportByPeriod(woo, segmentModel).subscribe((res: any) => {
        this.report = res[0];

        this.chartLabels = [];
        this.chartData[0].data = [];

        for (const [key, value] of Object.entries(this.report.totals)) {
          let stats: any;
          stats = value;
          this.chartLabels.push(formatDate(key, 'dd/MM/yyyy', 'fr'));
          this.chartData[0].data.push(stats.sales);
        }
        loading.dismiss();
      });
    });
  }

  async loadReportCustom(date_min, date_max) {
    const loading = await this.loadingController.create({
      cssClass: 'loading',
    });
    await loading.present();
    this.woo.getWooChannel().then(woo => {
      this.woo.getSalesReportByCustomPeriod(woo, date_min, date_max).subscribe((res: any) => {
        this.report = res[0];

        this.chartLabels = [];
        this.chartData[0].data = [];

        for (const [key, value] of Object.entries(this.report.totals)) {
          let stats: any;
          stats = value;
          this.chartLabels.push(formatDate(key, 'dd/MM/yyyy', 'fr'));
          this.chartData[0].data.push(stats.sales);
        }
        loading.dismiss();
      });
    });
  }

  onSegmentSelected(evt) {
    console.log('select')
  }

  async segmentChanged(evt) {
    if (!evt.detail.value) {

    }
    else if (evt.detail.value == 'custom') {
      console.log('custom');
      const alert = await this.alertController.create({
        header: 'Période',
        inputs: [
          {
            name: 'date_min',
            type: 'date',
            placeholder: 'Date début'
          },
          // input date without min nor max
          {
            name: 'date_max',
            type: 'date',
            placeholder: 'Date fin'
          }
        ],
        buttons: [
          {
            text: 'ANNULER',
            role: 'cancel',
            cssClass: 'danger',
            handler: () => { 
              this.date_min = null;
              this.date_max = null;
              this.segmentModel = 'week';
            }
          }, {
            text: 'VALIDER',
            cssClass: 'dark',
            handler: async (data) => {
              this.date_min = data.date_min;
              this.date_max = data.date_max;
              if (!this.date_min || !this.date_max) {
                this.presentToast("🚫 Aucune date saisie");
                this.segmentModel = 'week';
              }
              else if (this.date_min >= this.date_max) {
                this.presentToast("🚫 Date de fin supérieur à date de début");
                this.segmentModel = 'week';
              }
              else {
                this.loadReportCustom(this.date_min, this.date_max)
              }
            }
          }
        ]
      });
      await alert.present();
    }
    else {
      this.loadReport(evt.detail.value)
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
