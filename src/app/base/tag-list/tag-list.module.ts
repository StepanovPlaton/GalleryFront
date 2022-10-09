import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagListComponent } from './tag-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { TagModule } from '../tag/tag.module';

@NgModule({
  imports: [CommonModule, TagModule],
  declarations: [TagListComponent],
  exports: [TagListComponent],
})
export class TagListModule {}
