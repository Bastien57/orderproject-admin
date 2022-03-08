import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then( m => m.OrdersPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'order/:idFirebase',
    loadChildren: () => import('./order/order.module').then( m => m.OrderPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'order',
    redirectTo: 'orders'
  },
  {
    path: 'statistics',
    loadChildren: () => import('./statistics/statistics.module').then( m => m.StatisticsPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'stocks',
    loadChildren: () => import('./stocks/stocks.module').then( m => m.StocksPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'stock',
    loadChildren: () => import('./stock/stock.module').then( m => m.StockPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then( m => m.ProductsPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'product',
    loadChildren: () => import('./product/product.module').then( m => m.ProductPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'create-product',
    loadChildren: () => import('./create-product/create-product.module').then( m => m.CreateProductPageModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  {
    path: 'modal-image',
    loadChildren: () => import('./modals/image/image.module').then( m => m.ImagePageModule)
  },
  {
    path: 'modal-categories',
    loadChildren: () => import('./modals/categories/categories.module').then( m => m.CategoriesPageModule)
  },
  {
    path: 'modal-variation',
    loadChildren: () => import('./modals/variation/variation.module').then( m => m.VariationPageModule)
  },
  {
    path: 'categories',
    loadChildren: () => import('./categories/categories.module').then( m => m.CategoriesPageModule)
  },
  {
    path: 'closing-days',
    loadChildren: () => import('./closing-days/closing-days.module').then( m => m.ClosingDaysPageModule)
  },
  {
    path: 'create-closing-days',
    loadChildren: () => import('./create-closing-days/create-closing-days.module').then( m => m.CreateClosingDaysPageModule)
  },
  {
    path: 'calendar',
    loadChildren: () => import('./modals/calendar/calendar.module').then( m => m.CalendarPageModule)
  },
  {
    path: 'create-variation',
    loadChildren: () => import('./modals/create-variation/create-variation.module').then( m => m.CreateVariationPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
