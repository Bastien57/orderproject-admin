import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateVariationPageRoutingModule } from './create-variation-routing.module';

import { CreateVariationPage } from './create-variation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateVariationPageRoutingModule
  ],
  declarations: [CreateVariationPage]
})
export class CreateVariationPageModule {}
