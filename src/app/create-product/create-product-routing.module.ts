import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateProductPage } from './create-product.page';

const routes: Routes = [
  {
    path: '',
    component: CreateProductPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateProductPageRoutingModule {}
