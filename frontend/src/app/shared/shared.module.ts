import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import components from './components';
import { FormsModule } from '@angular/forms';

/**
 * All the declaration imports for NgModule
 */
const allDeclarations = [...components];

/**
 * All the common modules for NgModule
 */
//const allModules = modules;

@NgModule({
  declarations: allDeclarations,
  //imports: allModules,
  //exports: [...allDeclarations, ...allModules],
  exports: [...allDeclarations],
  imports: [CommonModule, IonicModule, FormsModule],
})
export class SharedModule {}
