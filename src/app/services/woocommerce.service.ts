import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class WoocommerceService {

  header = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(
    private http: HttpClient
  ) { 
  }

  async getWooChannel() {
    const channelStorage = await Storage.get({ key: 'woocommerce' });
    const channel = JSON.parse(channelStorage.value);
    return {
      consumerKey: channel.consumerKey,
      consumerSecret: channel.consumerSecret,
      url: channel.url,
      versionAPI: channel.versionAPI
    }
  }

  // PRODUCTS
  getProducts(woo, page) {
    return this.http.get<any[]>(`${woo.url}/wp-json/wc/v3/products?status=publish&per_page=32&page=${page}&consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`);
  }
  getProductsByIds(woo, ids) {
    return this.http.get<any[]>(`${woo.url}/wp-json/wc/v3/products?status=publish&include=${ids}&per_page=100&consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`);
  }
  getProductsBySearch(woo, search, page) {
    return this.http.get<any[]>(`${woo.url}/wp-json/wc/v3/products?search=${search}&status=publish&per_page=32&page=${page}&consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`);
  }
  getProduct(woo, id) {
    return this.http.get<any[]>(`${woo.url}/wp-json/wc/v3/products/${id}?consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`);
  }
  createProduct(woo, data) {
    return this.http.post<any[]>(`${woo.url}/wp-json/wc/v3/products?consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`, data, { headers: this.header });
  }
  updateProduct(woo, id, data) {
    return this.http.put<any[]>(`${woo.url}/wp-json/wc/v3/products/${id}?consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`, data, { headers: this.header });
  }
  batchUpdateProducts(woo, data) {
    return this.http.post<any[]>(`${woo.url}/wp-json/wc/v3/products/batch?consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`, data, { headers: this.header });
  }
  deleteProduct(woo, id) {
    return this.http.delete<any[]>(`${woo.url}/wp-json/wc/v3/products/${id}?force=true&consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`);
  }
  getProductVariations(woo, id) {
    return this.http.get<any[]>(`${woo.url}/wp-json/wc/v3/products/${id}/variations?order=asc&per_page=100&consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`);
  }
  batchUpdateVariations(woo, id, data) {
    return this.http.post<any[]>(`${woo.url}/wp-json/wc/v3/products/${id}/variations/batch?consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`, data, { headers: this.header });
  }
  createVariation(woo, id, data) {
    return this.http.post<any[]>(`${woo.url}/wp-json/wc/v3/products/${id}/variations?consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`, data, { headers: this.header });
  }
  updateVariation(woo, idProduct, idVariation, data) {
    return this.http.put<any[]>(`${woo.url}/wp-json/wc/v3/products/${idProduct}/variations/${idVariation}?consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`, data, { headers: this.header });
  }
  deleteVariation(woo, idProduct, id) {
    return this.http.delete<any[]>(`${woo.url}/wp-json/wc/v3/products/${idProduct}/variations/${id}?force=true&consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`);
  }

  // CATEGORIES
  getCategories(woo) {
    return this.http.get<any[]>(`${woo.url}/wp-json/wc/v3/products/categories?per_page=100&consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`);
  }
  createCategorie(woo, data) {
    return this.http.post<any[]>(`${woo.url}/wp-json/wc/v3/products/categories?consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`, data, { headers: this.header });
  }
  deleteCategory(woo, id) {
    return this.http.delete<any[]>(`${woo.url}/wp-json/wc/v3/products/categories/${id}?force=true&consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`)
  }

  // ORDERS
  updateOrder(woo, id, data) {
    return this.http.put<any[]>(`${woo.url}/wp-json/wc/v3/orders/${id}?consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`, data);
  }

  // REPORTS
  getSalesReportByPeriod(woo, period) {
    return this.http.get<any[]>(`${woo.url}/wp-json/wc/v3/reports/sales?period=${period}&consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`);
  }
  getSalesReportByCustomPeriod(woo, date_min, date_max) {
    return this.http.get<any[]>(`${woo.url}/wp-json/wc/v3/reports/sales?date_min=${date_min}&date_max=${date_max}&consumer_key=${woo.consumerKey}&consumer_secret=${woo.consumerSecret}`);
  }

  addClosingDays(woo, exportDates) {
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const data = {
      datas: exportDates
    };
    const salt = (new Date()).getTime();
    return this.http.post<any[]>(`${woo.url}/wp-json/ordeready/add_delivery_date_holidays?${salt}`, data, {headers: header});
  }

  removeClosingDays(woo, res) {
    const header = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const data = {
      ids: res
    };
    const salt = (new Date()).getTime();
    return this.http.post<any[]>(`${woo.url}/wp-json/ordeready/remove_delivery_date_holidays?${salt}`, data, {headers: header});
  }

  getClosingDays(woo) {

    const salt = (new Date()).getTime();
    return this.http.get<any[]>(`${woo.url}/wp-json/ordeready/get_delivery_date_holidays?${salt}`);
  }

}
