import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateProductPageRoutingModule } from './create-product-routing.module';

import { CreateProductPage } from './create-product.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateProductPageRoutingModule
  ],
  declarations: [CreateProductPage]
})
export class CreateProductPageModule {}
