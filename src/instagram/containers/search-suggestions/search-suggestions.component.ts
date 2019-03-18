import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';

@Component({
    selector:'app-search-suggestions',
    styleUrls:['./search-suggestions.component.css'],
    template:`
        <div class="suggestions-div" *ngIf="this.suggestions">
            <ul class="list-group">
                <li class="list-group-item " *ngFor="let suggestion of suggestions ">
                    <a class="text-dark" routerLink="{{suggestion.username}}">
                        <div class="d-flex flex-row">
                            <div class="mr-3">
                                <img class="suggestion-avatar" src="{{suggestion.image}}"/>
                            </div>
                            <div>
                                <span><b>{{suggestion.username}}</b></span><br>
                                <span class="text-secondary small">{{suggestion.fullName}}</span>
                            </div>
                            
                        </div>
                        
                    </a>
                </li>
                
            </ul>
            
        </div>
        
    `
})

export class SearchSuggestionsComponent implements OnChanges,OnInit{
    @Input() value;
    suggestions;

    constructor(private data:DataService){
        this.data.searchUsersResult.subscribe(users=>this.suggestions=users);
    }

    ngOnInit(){}

    ngOnChanges(){
        this.data.search(this.value);
    }

}