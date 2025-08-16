<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\AdminDocumentsController;
use App\Http\Controllers\FacultyDocumentsController;
use App\Http\Controllers\ReviewerDocumentsController;
use App\Http\Controllers\DocumentUploadController;
use App\Http\Controllers\Landing\HomeController;
use App\Http\Controllers\Landing\AboutController;
use App\Http\Controllers\Landing\AboutAccreditationController;
use App\Models\User;

// Public routes
Route::get('/', fn() => Inertia::render('landing/welcome'))->name('home');
Route::get('/about', fn() => Inertia::render('landing/about'))->name('about');
Route::get('/faculty/accreditation', [AboutAccreditationController::class, 'show'])->name('faculty.accreditation');
Route::get('/faculty/btled', fn() => Inertia::render('landing/about/btled'))->name('faculty.btled');
Route::get('/faculty/bsent', fn() => Inertia::render('landing/about/bsent'))->name('faculty.bsent');
Route::get('/faculty/bsit', fn() => Inertia::render('landing/about/bsit'))->name('faculty.bsit');
Route::get('/certificate', fn() => Inertia::render('landing/certificate'))->name('certificate');
Route::get('/exhibit', fn() => inertia('landing/exhibit'))->name('exhibit');
Route::get('/programs', fn() => Inertia::render('landing/programs'))->name('programs');
Route::get('/programs/btled', fn() => Inertia::render('landing/pus/btled'))->name('programs.btled');
Route::get('/programs/bsent', fn() => Inertia::render('landing/pus/bsent'))->name('programs.bsent');
Route::get('/programs/bsit', fn() => Inertia::render('landing/pus/bsit'))->name('programs.bsit');



// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Redirect to dashboard based on user role
    Route::get('dashboard', [DashboardController::class, 'redirect'])->name('dashboard');  
    
    // Admin routes
    Route::get('admin/dashboard', fn() => Inertia::render('admin/dashboard'))->name('admin.dashboard');
    Route::get('admin/dashboard/data', [AdminDocumentsController::class, 'dashboardData'])->name('admin.dashboard.data');
    Route::get('/admin/users', [UserManagementController::class, 'index'])->name('admin.users');
    Route::post('/admin/users', [UserManagementController::class, 'store'])->name('admin.users.store');
    Route::put('/admin/users/{user}', [UserManagementController::class, 'update'])->name('admin.users.update');
    Route::put('/admin/users/{user}/password', [UserManagementController::class, 'updatePassword'])->name('admin.users.password');
    Route::delete('/admin/users/{user}', [UserManagementController::class, 'destroy'])->name('admin.users.destroy');
    Route::post('/admin/users/{user}/assign', [UserManagementController::class, 'assign'])->name('admin.users.assign');
    Route::get('admin/documents/', [AdminDocumentsController::class, 'index'])->name('admin.documents');
    Route::post('admin/documents/upload', [DocumentUploadController::class, 'upload'])->name('admin.documents.upload');
    Route::get('admin/documents/approved', [AdminDocumentsController::class, 'approvedDocuments'])->name('admin.documents.approved');
    Route::get('admin/documents/disapproved', [AdminDocumentsController::class, 'disapprovedPage'])->name('admin.documents.disapproved'); // <-- page route
    Route::get('admin/documents/disapproved/data', [AdminDocumentsController::class, 'disapprovedDocuments'])->name('admin.documents.disapproved.data'); // <-- data endpoint
    Route::get('admin/documents/pending', [AdminDocumentsController::class, 'pendingPage'])->name('admin.documents.pending');
    Route::get('admin/documents/pending/data', [AdminDocumentsController::class, 'pendingDocuments'])->name('admin.documents.pending.data');
    Route::get('admin/documents/pending/sidebar', [AdminDocumentsController::class, 'pendingSidebar'])->name('admin.documents.pending.sidebar');
    Route::get('admin/documents/pending/{document}', [AdminDocumentsController::class, 'viewPendingDocument'])->name('admin.documents.pending.view');
    Route::patch('admin/documents/pending/{document}/status', [AdminDocumentsController::class, 'updateStatus'])->name('admin.documents.pending.status');
    Route::delete('admin/documents/pending/{document}', [AdminDocumentsController::class, 'destroyPending'])->name('admin.documents.pending.delete');
    Route::get('admin/messages', fn() => Inertia::render('admin/messages'))->name('admin.messages');
    Route::get('admin/settings', fn() => Inertia::render('admin/settings'))->name('admin.settings');

    
    Route::prefix('admin/layout')->group(function () {
        Route::get('/home', [HomeController::class, 'index'])->name('admin.layout.home');
        Route::post('/home', [HomeController::class, 'update'])->name('admin.layout.home.update');
        Route::get('/about', [AboutController::class, 'index'])->name('admin.layout.about');
        Route::post('/about', [AboutController::class, 'update'])->name('admin.layout.about.update');
        Route::get('/about/accreditation', [AboutAccreditationController::class, 'index'])->name('admin.layout.about.accreditation');
        Route::post('/about/accreditation', [AboutAccreditationController::class, 'update'])->name('admin.layout.about.accreditation.update');
        Route::post('/about/accreditation', [AboutAccreditationController::class, 'update'])->name('admin.layout.about.accreditation.update');
        Route::get('/about/btled', fn() => inertia('admin/layout/AboutBTLED'))->name('admin.layout.about.btled');
        Route::get('/about/bsent', fn() => inertia('admin/layout/AboutBSENT'))->name('admin.layout.about.bsent');
        Route::get('/about/bsit', fn() => inertia('admin/layout/AboutBSIT'))->name('admin.layout.about.bsit');
        Route::get('/certificate', fn() => inertia('admin/layout/Certificate'))->name('admin.layout.certificate');
        Route::get('/programs', fn() => inertia('admin/layout/Programs'))->name('admin.layout.programs');
        Route::get('/programs/btled', fn() => inertia('admin/layout/ProgramsBTLED'))->name('admin.layout.programs.btled');
        Route::get('/programs/bsent', fn() => inertia('admin/layout/ProgramsBSENT'))->name('admin.layout.programs.bsent');
        Route::get('/programs/bsit', fn() => inertia('admin/layout/ProgramsBSIT'))->name('admin.layout.programs.bsit');
        Route::get('/exhibit', fn() => inertia('admin/layout/Exhibit'))->name('admin.layout.exhibit');
        Route::get('/exhibit/citizens-charter', fn() => inertia('admin/layout/ExhibitCitizensCharter'))->name('admin.layout.exhibit.citizens_charter');
        Route::get('/exhibit/student-handbook', fn() => inertia('admin/layout/ExhibitStudentHandbook'))->name('admin.layout.exhibit.student_handbook');
        Route::get('/exhibit/university-code', fn() => inertia('admin/layout/ExhibitUniversityCode'))->name('admin.layout.exhibit.university_code');
        Route::get('/exhibit/university-policies', fn() => inertia('admin/layout/ExhibitUniversityPolicies'))->name('admin.layout.exhibit.university_policies');
        Route::get('/exhibit/obe-syllabi', fn() => inertia('admin/layout/ExhibitObeSyllabi'))->name('admin.layout.exhibit.obe_syllabi');
        Route::get('/exhibit/instructional-materials', fn() => inertia('admin/layout/ExhibitInstructionalMaterials'))->name('admin.layout.exhibit.instructional_materials');
        Route::get('/exhibit/faculty-manual', fn() => inertia('admin/layout/ExhibitFacultyManual'))->name('admin.layout.exhibit.faculty_manual');
        Route::get('/exhibit/administrative-manual', fn() => inertia('admin/layout/ExhibitAdministrativeManual'))->name('admin.layout.exhibit.administrative_manual');
        Route::get('/exhibit/ched-memorandum-order', fn() => inertia('admin/layout/ExhibitChedMemorandumOrder'))->name('admin.layout.exhibit.ched_memorandum_order');
        Route::get('/exhibit/licensure', fn() => inertia('admin/layout/ExhibitLicensure'))->name('admin.layout.exhibit.licensure');
    });
    
    //Reviewer routes
    Route::get('reviewer/dashboard', fn() => Inertia::render('reviewer/dashboard'))->name('reviewer.dashboard');
    Route::get('reviewer/dashboard/data', [ReviewerDocumentsController::class, 'dashboardData'])->name('reviewer.dashboard.data');
    Route::get('reviewer/documents/', [ReviewerDocumentsController::class, 'index'])->name('reviewer.documents');
    Route::post('reviewer/documents/upload', [DocumentUploadController::class, 'upload'])->name('reviewer.documents.upload');
    Route::get('reviewer/documents/approved', [ReviewerDocumentsController::class, 'approvedDocuments'])->name('reviewer.documents.approved');
    Route::get('reviewer/documents/disapproved', [ReviewerDocumentsController::class, 'disapprovedPage'])->name('reviewer.documents.disapproved'); // <-- page route
    Route::get('reviewer/documents/disapproved/data', [ReviewerDocumentsController::class, 'disapprovedDocuments'])->name('reviewer.documents.disapproved.data'); // <-- data endpoint
    Route::get('reviewer/documents/pending', [ReviewerDocumentsController::class, 'pendingPage'])->name('reviewer.documents.pending');
    Route::get('reviewer/documents/pending/data', [ReviewerDocumentsController::class, 'pendingDocuments'])->name('reviewer.documents.pending.data');
    Route::get('reviewer/documents/pending/sidebar', [ReviewerDocumentsController::class, 'pendingSidebar'])->name('reviewer.documents.pending.sidebar');
    Route::get('reviewer/documents/pending/{document}', [ReviewerDocumentsController::class, 'viewPendingDocument'])->name('reviewer.documents.pending.view');
    Route::patch('reviewer/documents/pending/{document}/status', [ReviewerDocumentsController::class, 'updateStatus'])->name('reviewer.documents.pending.status');
    Route::delete('reviewer/documents/pending/{document}', [ReviewerDocumentsController::class, 'destroyPending'])->name('reviewer.documents.pending.delete');
    Route::get('reviewer/messages', fn() => Inertia::render('reviewer/messages'))->name('reviewer.messages');
    Route::get('reviewer/settings', fn() => Inertia::render('reviewer/settings'))->name('reviewer.settings');
   
    //Faculty routes
    Route::get('faculty/dashboard', fn() => Inertia::render('faculty/dashboard'))->name('faculty.dashboard');
    Route::get('faculty/dashboard/data', [FacultyDocumentsController::class, 'dashboardData'])->name('faculty.dashboard.data');
    Route::get('faculty/documents/', [FacultyDocumentsController::class, 'index'])->name('faculty.documents');
    Route::post('faculty/documents/upload', [DocumentUploadController::class, 'upload'])->name('faculty.documents.upload');
    Route::get('faculty/documents/approved', [FacultyDocumentsController::class, 'approvedDocuments'])->name('faculty.documents.approved');
    Route::get('faculty/documents/disapproved', [FacultyDocumentsController::class, 'disapprovedPage'])->name('faculty.documents.disapproved'); // <-- page route
    Route::get('faculty/documents/disapproved/data', [FacultyDocumentsController::class, 'disapprovedDocuments'])->name('faculty.documents.disapproved.data'); // <-- data endpoint
    Route::get('faculty/documents/pending', [FacultyDocumentsController::class, 'pendingPage'])->name('faculty.documents.pending');
    Route::get('faculty/documents/pending/data', [FacultyDocumentsController::class, 'pendingDocuments'])->name('faculty.documents.pending.data');
    Route::get('faculty/documents/pending/sidebar', [FacultyDocumentsController::class, 'pendingSidebar'])->name('faculty.documents.pending.sidebar');
    Route::get('faculty/documents/pending/{document}', [FacultyDocumentsController::class, 'viewPendingDocument'])->name('faculty.documents.pending.view');
    Route::patch('faculty/documents/pending/{document}/status', [FacultyDocumentsController::class, 'updateStatus'])->name('faculty.documents.pending.status');
    Route::delete('faculty/documents/pending/{document}', [FacultyDocumentsController::class, 'destroyPending'])->name('faculty.documents.pending.delete');
    Route::get('faculty/messages', fn() => Inertia::render('faculty/messages'))->name('faculty.messages');
    Route::get('faculty/settings', fn() => Inertia::render('faculty/settings'))->name('faculty.settings');
   
    // Unified messages route redirects to role-based page
    Route::get('/messages', function() {
        $user = \Illuminate\Support\Facades\Auth::user();
        $role = $user?->role ?? 'faculty';
        return match($role) {
            'admin' => Inertia::render('messages/index'),
            'reviewer' => Inertia::render('reviewer/messages'),
            default => Inertia::render('faculty/messages'),
        };
    })->name('messages');

    // Messaging helpers
    Route::get('/api/users/search', function() {
        $q = request('q', '');
        return User::query()
            ->when($q, fn($qry) => $qry->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%"))
            ->limit(20)
            ->get(['id','name','email']);
    })->name('api.users.search');



});

    // Landing Content API
    Route::get('/api/landing-content', [HomeController::class, 'getContent'])->name('api.landing.content');
    Route::get('/api/about-content', [AboutController::class, 'getContent'])->name('api.about.content');
    Route::get('/api/accreditation-content', [AboutAccreditationController::class, 'getContent'])->name('api.accreditation.content');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
