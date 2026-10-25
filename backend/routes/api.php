<?php

use App\Http\Controllers\Api\KrsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Katalog Mata Kuliah
Route::get('/mata-kuliah', [KrsController::class, 'getMataKuliah']);

// KRS Mahasiswa
Route::get('/krs', [KrsController::class, 'getKrs']);
Route::post('/krs', [KrsController::class, 'storeKrs']);
Route::delete('/krs/{id}', [KrsController::class, 'destroyKrs']);
Route::post('/krs/ajukan', [KrsController::class, 'ajukanKrs']);

// Fitur Simulasi & Reset Demo Seminar
Route::post('/krs/reset', [KrsController::class, 'resetDemo']);
