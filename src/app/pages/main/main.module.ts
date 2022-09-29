import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { TagModule } from 'src/app/base/tag/tag.module';
import { AddImageComponent } from './add-image/add-image.component';
import { AuthComponent } from './modals/auth/auth.component';
import { ImageViewComponent } from './modals/image-view/image-view.component';

@NgModule({
  imports: [CommonModule, MainRoutingModule, TagModule],
  declarations: [
    MainComponent,
    AddImageComponent,
    AuthComponent,
    ImageViewComponent,
  ],
})
export class MainModule {}
