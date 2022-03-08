import { Component, OnInit } from '@angular/core';

import { ModalController } from '@ionic/angular';

import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image',
  templateUrl: './image.page.html',
  styleUrls: ['./image.page.scss'],
})
export class ImagePage implements OnInit {

  croppedImage: any = null;
  imageChangedEvent: any = null;

  constructor(
    public modalController: ModalController
  ) { }

  ngOnInit() {
  }

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event;
  }
  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }

  closeModal() {
    this.modalController.dismiss();
  }

  uploadImage() {
    this.modalController.dismiss({
      croppedImage: this.croppedImage,
      name: this.imageChangedEvent.target.files[0].name
    })
  }

}

