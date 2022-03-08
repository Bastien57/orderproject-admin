import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateVariationPage } from './create-variation.page';

const routes: Routes = [
  {
    path: '',
    component: CreateVariationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateVariationPageRoutingModule {}
