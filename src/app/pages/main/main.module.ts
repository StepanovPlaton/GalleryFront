import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { AddImageComponent } from './add-image/add-image.component';
import { AuthComponent } from './modals/auth/auth.component';
import { ImageViewComponent } from './modals/image-view/image-view.component';
import { TagListModule } from 'src/app/base/tag-list/tag-list.module';

@NgModule({
  imports: [CommonModule, MainRoutingModule, TagListModule],
  declarations: [
    MainComponent,
    AddImageComponent,
    AuthComponent,
    ImageViewComponent,
  ],
})
export class MainModule {}
