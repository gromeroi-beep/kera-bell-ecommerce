// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Añadido para formularios

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

// 1. Módulos de Librerías Añadidas (Para el CartService y la persistencia)
import { IonicStorageModule } from '@ionic/storage-angular'; 

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module'; // Asumiendo que usas un archivo de rutas principal

// 2. Módulos de Componentes Compartidos (Necesario para usar ProductCard)
// IMPORTANTE: Si usas componentes standalone, este módulo compartido no es necesario,
// pero lo incluimos por buenas prácticas si usas NgModules tradicionales.
import { SharedModule } from './shared/shared.module'; 

@NgModule({
  declarations: [
    AppComponent
    // Si no usas standalone, aquí irían todos tus componentes/páginas: HomePage, LoginPage, etc.
  ],
  imports: [
    BrowserModule,
    // Angular Core Forms (Necesario para el ProductFormPage del Admin)
    FormsModule,
    ReactiveFormsModule, 
    
    IonicModule.forRoot(),
    AppRoutingModule,
    
    // 3. Configuración del Storage de Ionic (CRÍTICO para el CartService)
    IonicStorageModule.forRoot(), 
    
    // Si creaste un SharedModule, impórtalo aquí
    SharedModule, 
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    // Los servicios (AuthService, CartService, FirebaseService) 
    // están provistos en 'root' (providedIn: 'root'), por lo que no necesitan listarse aquí.
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}