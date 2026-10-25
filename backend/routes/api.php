<?php

use App\Http\Controllers\Api\KrsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Katalog Mata Kuliah (Cached / Read-friendly)
Route::get('/mata-kuliah', [KrsController::class, 'getMataKuliah']);

// KRS Mahasiswa
Route::get('/krs', [KrsController::class, 'getKrs']);

// Mutasi KRS dengan proteksi Rate Limiting (Maks 60 request / menit)
Route::middleware('throttle:60,1')->group(function () {
    Route::post('/krs', [KrsController::class, 'storeKrs']);
    Route::delete('/krs/{id}', [KrsController::class, 'destroyKrs']);
    Route::post('/krs/ajukan', [KrsController::class, 'ajukanKrs']);
    Route::post('/krs/reset', [KrsController::class, 'resetDemo']);
});
