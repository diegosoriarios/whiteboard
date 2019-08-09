import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WhiteboardPageComponent } from './whiteboard-page/whiteboard-page.component'


const routes: Routes = [
  { path: 'whiteboard', component: WhiteboardPageComponent },
  { path: '**', component: WhiteboardPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
