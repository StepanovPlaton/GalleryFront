import { HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { last, map, of, switchMap } from 'rxjs';
import { ADD_IMAGE } from 'src/app/shared/consts/images.const';
import { IImage } from 'src/app/shared/models/image.model';
import { ApiService } from 'src/app/shared/services/api.service';

@Component({
  selector: 'app-add-image',
  templateUrl: './add-image.component.html',
  styleUrls: ['./add-image.component.scss'],
})
export class AddImageComponent implements OnInit {
  ADD_IMAGE = ADD_IMAGE;

  showProgressBar: boolean = false;
  loadingProgress: { fileTmpId: string; loadingProgress: number }[] = [];

  @Output()
  addNewImage = new EventEmitter<IImage>();

  constructor(private readonly apiService: ApiService) {}

  ngOnInit() {}

  uploadImage(event: any) {
    let files: File[] = event.target.files;
    for (let file of files) {
      this.apiService
        .addImage(file)
        .pipe(
          map((event) => {
            switch (event.type) {
              case HttpEventType.Sent:
                this.showProgressBar = true;
                this.loadingProgress = [];
                return null;

              case HttpEventType.UploadProgress:
                if (
                  this.loadingProgress.some(
                    (fileLoadingProgress) =>
                      fileLoadingProgress.fileTmpId === file.name + file.size
                  )
                ) {
                  for (let lp of this.loadingProgress) {
                    if (lp.fileTmpId === file.name + file.size) {
                      lp.loadingProgress = event.total
                        ? Math.round((100 * event.loaded) / event.total)
                        : 0;
                    }
                  }
                } else {
                  this.loadingProgress.push({
                    fileTmpId: file.name + file.size,
                    loadingProgress: event.total
                      ? Math.round((100 * event.loaded) / event.total)
                      : 0,
                  });
                }
                return null;

              case HttpEventType.Response:
                this.showProgressBar = false;
                return event.body;
            }
            return null;
          }),
          last(),
          switchMap((event) => {
            if (event) {
              return this.apiService.getImage(event.imageId);
            }
            return of(null);
          })
        )
        .subscribe((image) => {
          if (image) {
            this.addNewImage.next(image);
          }
        });
    }
  }

  getGlobalLoadingProgress() {
    return (
      this.loadingProgress.reduce((sum, v) => {
        return sum + v.loadingProgress;
      }, 0) / this.loadingProgress.length
    );
  }
}
