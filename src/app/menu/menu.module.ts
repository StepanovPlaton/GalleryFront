import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu.component';
import { BrowserModule } from '@angular/platform-browser';
import { EditSectionComponent } from './edit-section/edit-section.component';
import { TagListModule } from '../base/tag-list/tag-list.module';
import { TagModule } from '../base/tag/tag.module';

@NgModule({
  imports: [CommonModule, BrowserModule, TagModule, TagListModule],
  declarations: [MenuComponent, EditSectionComponent],
  exports: [MenuComponent],
})
export class MenuModule {}
