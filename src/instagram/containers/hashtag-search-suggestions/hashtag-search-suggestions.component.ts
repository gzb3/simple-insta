import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';

@Component({
    selector:'app-hashtag-search-suggestions',
    styleUrls:['./hashtag-search-suggestions.component.css'],
    template:`
        <div class="suggestions-div" *ngIf="this.suggestions">
            <ul class="list-group">
                <li class="list-group-item " *ngFor="let suggestion of suggestions ">
                    <a class="text-dark" routerLink="/explore/tags/{{suggestion.hashtagName}}">
                        <div class="d-flex flex-row">
                            <div>
                                <span class=" large">#</span>
                            </div>
                            
                            <div>
                                <span><b>{{suggestion.hashtagName}}</b></span><br>
                                <span class=" small">{{suggestion.number}} posts</span>
                            </div>
                        </div>
                        
                    </a>
                </li>
                
            </ul>
            
        </div>
        
    `
})

export class HashtagSearchSuggestionsComponent implements OnChanges,OnInit{
    @Input() value;//input search value
    suggestions;

    constructor(private data:DataService){
        this.data.searchTagsResult.subscribe(tags=>this.suggestions=tags);
    }

    ngOnInit(){}

    ngOnChanges(){
        this.data.search(this.value);
    }

}