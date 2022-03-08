import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClosingDaysPageRoutingModule } from './closing-days-routing.module';

import { ClosingDaysPage } from './closing-days.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClosingDaysPageRoutingModule
  ],
  declarations: [ClosingDaysPage]
})
export class ClosingDaysPageModule {}
