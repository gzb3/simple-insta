import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {SocketIoConfig, SocketIoModule} from 'ngx-socket-io';
import {InstagramModule} from '../instagram/instagram.module';
import {AppRouting} from './app.routing';
import {NavigationComponent} from '../instagram/containers/navigation/navigation.component';
import {NotificationComponent} from '../instagram/containers/notifications/notification.component';
import {SearchSuggestionsComponent} from '../instagram/containers/search-suggestions/search-suggestions.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HashtagSearchSuggestionsComponent} from '../instagram/containers/hashtag-search-suggestions/hashtag-search-suggestions.component';
const config: SocketIoConfig={url:'http://localhost:4444',options:{}};
@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    NotificationComponent,
    SearchSuggestionsComponent,
    HashtagSearchSuggestionsComponent
  ],
  imports: [
      InstagramModule,
      AppRouting,
      BrowserModule,
      SocketIoModule.forRoot(config),
      FormsModule,
      ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
