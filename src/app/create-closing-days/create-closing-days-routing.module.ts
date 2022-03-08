import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateClosingDaysPage } from './create-closing-days.page';

const routes: Routes = [
  {
    path: '',
    component: CreateClosingDaysPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateClosingDaysPageRoutingModule {}
