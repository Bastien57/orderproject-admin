import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateClosingDaysPageRoutingModule } from './create-closing-days-routing.module';

import { CreateClosingDaysPage } from './create-closing-days.page';
import { CalendarModule } from 'ion2-calendar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateClosingDaysPageRoutingModule,
    CalendarModule
  ],
  declarations: [CreateClosingDaysPage]
})
export class CreateClosingDaysPageModule {}
