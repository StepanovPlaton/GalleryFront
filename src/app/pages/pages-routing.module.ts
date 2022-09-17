import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'main',
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./main/main.module').then((m) => m.MainModule),
      },
      {
        path: 'sections/:sectionId',
        loadChildren: () =>
          import('./main/main.module').then((m) => m.MainModule),
      },
    ],
  },

  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'main',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
