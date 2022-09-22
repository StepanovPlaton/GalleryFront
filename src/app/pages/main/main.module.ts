import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { TagModule } from 'src/app/base/tag/tag.module';

@NgModule({
  imports: [CommonModule, MainRoutingModule, TagModule],
  declarations: [MainComponent],
})
export class MainModule {}
