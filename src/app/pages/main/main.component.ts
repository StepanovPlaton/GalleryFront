import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import { LOCK, UNLOCK } from 'src/app/shared/consts/images.const';
import { IImage } from 'src/app/shared/models/image.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthorizationService } from 'src/app/shared/services/authorization.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements AfterViewInit {
  LOCK = LOCK;
  UNLOCK = UNLOCK;

  imagesTable: IImage[][] = [];
  images: IImage[] = [];

  showImageModal: boolean = false;
  openedImage: IImage | null = null;

  loading: boolean = true;

  adminFunctionsLocked: boolean = true;
  showAuthModal: boolean = false;
  adminPassword: string = '';

  @ViewChild('getWidth') getWidth: ElementRef | undefined;
  columnCount: number = 3;

  constructor(
    private readonly apiService: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthorizationService
  ) {
    this.authService.$token.subscribe(
      (token) => (this.adminFunctionsLocked = authService.authorized)
    );
  }

  ngAfterViewInit(): void {
    combineLatest([this.route.paramMap, this.apiService.getListOfSections()])
      .pipe(
        switchMap(([params, sections]) => {
          this.images = [];
          this.imagesTable = [];
          this.loading = true;
          if (
            params.has('sectionId') &&
            sections.some(
              (section) => section.sectionId == +(params.get('sectionId') ?? 0)
            )
          ) {
            return this.apiService.getSectionImages(
              +(params.get('sectionId') ?? 0)
            );
          } else {
            return this.apiService.getAllImages();
          }
        })
      )
      .subscribe((images) => {
        this.images = images;
        for (let i = 0; i < 5; i++) {
          images.forEach((image) => {
            this.images.push(image);
          });
        }
        if (this.getWidth) {
          this.columnCount = Math.trunc(
            this.getWidth.nativeElement.clientWidth / 300
          );
          this.columnCount = this.columnCount < 2 ? 2 : this.columnCount;
          for (let i = 0; i < this.columnCount; i++) {
            let col: IImage[] = [];
            for (let i = 0; i < 5; i++) {
              const image = this.images.pop();
              if (image) col.push(image);
              else break;
            }
            if (col.length !== 0) this.imagesTable.push(col);
            if (this.images.length === 0) break;
          }
        }
        this.loading = false;
      });
  }

  closeImageModal() {
    this.showImageModal = false;
    setTimeout(() => {
      this.openedImage = null;
      this.cdr.markForCheck();
    }, 500);
  }

  closeAuthModal() {
    this.showAuthModal = false;
    setTimeout(() => {
      this.openedImage = null;
      this.cdr.markForCheck();
    }, 500);
  }

  auth() {
    this.authService.authorization(this.adminPassword);
  }
}
