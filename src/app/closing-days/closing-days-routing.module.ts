import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClosingDaysPage } from './closing-days.page';

const routes: Routes = [
  {
    path: '',
    component: ClosingDaysPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClosingDaysPageRoutingModule {}
