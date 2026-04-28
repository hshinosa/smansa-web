<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;

class RedirectController extends Controller
{
    public function login(): RedirectResponse
    {
        return redirect()->route('admin.login.form');
    }
}
