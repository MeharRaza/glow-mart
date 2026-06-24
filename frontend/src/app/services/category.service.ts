import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  subcategories: string[];
  order: number;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private api  = 'http://localhost:8001/api';

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.api}/categories/`);
  }
}
