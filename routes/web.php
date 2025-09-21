<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\User;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\AdminDocumentsController;
use App\Http\Controllers\FacultyDocumentsController;
use App\Http\Controllers\ReviewerDocumentsController;
use App\Http\Controllers\DocumentUploadController;
use App\Http\Controllers\Landing\HomeController;
use App\Http\Controllers\Landing\AboutController;
use App\Http\Controllers\Landing\AboutAccreditationController;
use App\Http\Controllers\Landing\AboutBtledController;
use App\Http\Controllers\Landing\CertificateController;
use App\Http\Controllers\Landing\AboutBsitController;
use App\Http\Controllers\Landing\AboutBsentController;
use App\Http\Controllers\Landing\ProgramsUnderSurveyController;
use App\Http\Controllers\Landing\ProgramsBtledController;
use App\Http\Controllers\Landing\ProgramsBsentController;
use App\Http\Controllers\Landing\ProgramsBsitController;
use App\Http\Controllers\Landing\ExhibitController;
use App\Http\Controllers\Landing\ExhibitCitizensCharterController;
use App\Http\Controllers\Landing\ExhibitStudentHandbookController;
use App\Http\Controllers\Landing\ExhibitUniversityCodeController;
use App\Http\Controllers\Landing\ExhibitUniversityPoliciesController;
use App\Http\Controllers\Landing\ExhibitObeSyllabiController;
use App\Http\Controllers\Landing\ExhibitInstructionalMaterialsController;
use App\Http\Controllers\Landing\ExhibitFacultyManualController;
use App\Http\Controllers\Landing\ExhibitAdministrativeManualController;
use App\Http\Controllers\Landing\ExhibitChedMemorandumOrderController;
use App\Http\Controllers\Landing\ExhibitLicensureController;
use App\Http\Controllers\Landing\ExhibitCopcController;
use App\Http\Controllers\Landing\ExhibitBorController;
use App\Http\Controllers\Landing\ExhibitPsvController;

// Public routes
Route::get('/', [HomeController::class, 'show'])->name('home');
Route::get('/about', [AboutController::class, 'show'])->name('about');
Route::get('/faculty/accreditation', [AboutAccreditationController::class, 'show'])->name('faculty.accreditation');
Route::get('/faculty/btled', [AboutBtledController::class, 'show'])->name('faculty.btled');
Route::get('/faculty/bsent', [AboutBsentController::class, 'show'])->name('faculty.bsent');
Route::get('/faculty/bsit', [AboutBsitController::class, 'show'])->name('faculty.bsit');
Route::get('/certificate', [CertificateController::class, 'show'])->name('certificate');
Route::get('/exhibit', [ExhibitController::class, 'show'])->name('exhibit');
Route::get('/programs', [ProgramsUnderSurveyController::class, 'show'])->name('programs');
Route::get('/programs/btled', [ProgramsBtledController::class, 'show'])->name('programs.btled');
Route::get('/programs/btled/documents', [ProgramsBtledController::class, 'getApprovedDocuments'])->name('programs.btled.documents');
Route::get('/programs/bsent', [ProgramsBsentController::class, 'show'])->name('programs.bsent');
Route::get('/programs/bsent/documents', [ProgramsBsentController::class, 'getApprovedDocuments'])->name('programs.bsent.documents');
Route::get('/programs/bsit', [ProgramsBsitController::class, 'show'])->name('programs.bsit');
Route::get('/programs/bsit/documents', [ProgramsBsitController::class, 'getApprovedDocuments'])->name('programs.bsit.documents');
Route::get('/exhibit/citizens-charter', [ExhibitCitizensCharterController::class, 'show'])->name('exhibit.citizens-charter');
Route::get('/exhibit/student-handbook', [ExhibitStudentHandbookController::class, 'show'])->name('exhibit.student-handbook');
Route::get('/exhibit/university-code', [ExhibitUniversityCodeController::class, 'show'])->name('exhibit.university-code');
Route::get('/exhibit/university-policies', [ExhibitUniversityPoliciesController::class, 'show'])->name('exhibit.university-policies');
Route::get('/exhibit/obe-syllabi', [ExhibitObeSyllabiController::class, 'show'])->name('exhibit.obe-syllabi');
Route::get('/exhibit/instructional-materials', [ExhibitInstructionalMaterialsController::class, 'show'])->name('exhibit.instructional-materials');
Route::get('/exhibit/faculty-manual', [ExhibitFacultyManualController::class, 'show'])->name('exhibit.faculty-manual');
Route::get('/exhibit/administrative-manual', [ExhibitAdministrativeManualController::class, 'show'])->name('exhibit.administrative-manual');
Route::get('/exhibit/ched-memorandum-order', [ExhibitChedMemorandumOrderController::class, 'show'])->name('exhibit.ched-memorandum-order');
Route::get('/exhibit/licensure', [ExhibitLicensureController::class, 'show'])->name('exhibit.licensure');
Route::get('/exhibit/copc', [ExhibitCopcController::class, 'show'])->name('exhibit.copc');
Route::get('/exhibit/bor', [ExhibitBorController::class, 'show'])->name('exhibit.bor');
Route::get('/exhibit/psv', [ExhibitPsvController::class, 'show'])->name('exhibit.psv');




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
    Route::delete('admin/documents/approved/{document}', [AdminDocumentsController::class, 'destroyApproved'])->name('admin.documents.approved.delete');
    Route::get('admin/messages', fn() => Inertia::render('admin/messages'))->name('admin.messages');
    Route::get('admin/settings', fn() => Inertia::render('admin/settings'))->name('admin.settings');

    // Test route for PDF compression tools
    Route::get('admin/test-compression', function() {
        $service = new \App\Services\FileOptimizationService();
        
        // Test tool availability
        $reflection = new \ReflectionClass($service);
        $isGhostscriptAvailable = $reflection->getMethod('isGhostscriptAvailable');
        $isGhostscriptAvailable->setAccessible(true);
        $ghostscriptAvailable = $isGhostscriptAvailable->invoke($service);
        
        $isQpdfAvailable = $reflection->getMethod('isQpdfAvailable');
        $isQpdfAvailable->setAccessible(true);
        $qpdfAvailable = $isQpdfAvailable->invoke($service);
        
        return response()->json([
            'ghostscript_available' => $ghostscriptAvailable,
            'qpdf_available' => $qpdfAvailable,
            'system_info' => [
                'os' => PHP_OS,
                'php_version' => PHP_VERSION,
                'temp_dir' => sys_get_temp_dir(),
                'storage_path' => storage_path('app/public'),
            ]
        ]);
    })->name('admin.test.compression');

    
    Route::prefix('admin/layout')->group(function () {
        Route::get('/home', [HomeController::class, 'index'])->name('admin.layout.home');
        Route::post('/home', [HomeController::class, 'update'])->name('admin.layout.home.update');
        Route::get('/about', [AboutController::class, 'index'])->name('admin.layout.about');
        Route::post('/about', [AboutController::class, 'update'])->name('admin.layout.about.update');
        Route::get('/about/accreditation', [AboutAccreditationController::class, 'index'])->name('admin.layout.about.accreditation');
        Route::post('/about/accreditation', [AboutAccreditationController::class, 'update'])->name('admin.layout.about.accreditation.update');
        Route::get('/about/btled', [AboutBtledController::class, 'index'])->name('admin.layout.about.btled');
        Route::post('/about/btled', [AboutBtledController::class, 'update'])->name('admin.layout.about.btled.update');
        Route::get('/about/bsent', [AboutBsentController::class, 'index'])->name('admin.layout.about.bsent');
        Route::post('/about/bsent', [AboutBsentController::class, 'update'])->name('admin.layout.about.bsent.update');
        Route::get('/about/bsit', [AboutBsitController::class, 'index'])->name('admin.layout.about.bsit');
        Route::post('/about/bsit', [AboutBsitController::class, 'update'])->name('admin.layout.about.bsit.update');
        Route::get('/certificate', [CertificateController::class, 'index'])->name('admin.layout.certificate');
        Route::post('/certificate', [CertificateController::class, 'update'])->name('admin.layout.certificate.update');
        Route::get('/programs', [ProgramsUnderSurveyController::class, 'index'])->name('admin.layout.programs');
        Route::post('/programs', [ProgramsUnderSurveyController::class, 'update'])->name('admin.layout.programs.update');
        Route::get('/programs/btled', [ProgramsBtledController::class, 'index'])->name('admin.layout.programs.btled');
        Route::post('/programs/btled', [ProgramsBtledController::class, 'update'])->name('admin.layout.programs.btled.update');
        Route::get('/programs/bsent', [ProgramsBsentController::class, 'index'])->name('admin.layout.programs.bsent');
        Route::post('/programs/bsent', [ProgramsBsentController::class, 'update'])->name('admin.layout.programs.bsent.update');
        Route::get('/programs/bsit', [ProgramsBsitController::class, 'index'])->name('admin.layout.programs.bsit');
        Route::post('/programs/bsit', [ProgramsBsitController::class, 'update'])->name('admin.layout.programs.bsit.update');
        Route::get('/exhibit', [ExhibitController::class, 'index'])->name('admin.layout.exhibit');
        Route::post('/exhibit', [ExhibitController::class, 'update'])->name('admin.layout.exhibit.update');
        Route::get('/exhibit/citizens-charter', [ExhibitCitizensCharterController::class, 'index'])->name('admin.layout.exhibit.citizens-charter');
        Route::post('/exhibit/citizens-charter', [ExhibitCitizensCharterController::class, 'update'])->name('admin.layout.exhibit.citizens-charter.update');
        Route::get('/exhibit/student-handbook', [ExhibitStudentHandbookController::class, 'index'])->name('admin.layout.exhibit.student_handbook');
        Route::post('/exhibit/student-handbook', [ExhibitStudentHandbookController::class, 'update'])->name('admin.layout.exhibit.student_handbook.update');
        Route::get('/exhibit/university-code', [ExhibitUniversityCodeController::class, 'index'])->name('admin.layout.exhibit.university_code');
        Route::post('/exhibit/university-code', [ExhibitUniversityCodeController::class, 'update'])->name('admin.layout.exhibit.university_code.update');
        Route::get('/exhibit/university-policies', [ExhibitUniversityPoliciesController::class, 'index'])->name('admin.layout.exhibit.university_policies');
        Route::post('/exhibit/university-policies', [ExhibitUniversityPoliciesController::class, 'update'])->name('admin.layout.exhibit.university_policies.update');
        Route::get('/exhibit/obe-syllabi', [ExhibitObeSyllabiController::class, 'index'])->name('admin.layout.exhibit.obe_syllabi');
        Route::post('/exhibit/obe-syllabi', [ExhibitObeSyllabiController::class, 'update'])->name('admin.layout.exhibit.obe_syllabi.update');
        Route::get('/exhibit/instructional-materials', [ExhibitInstructionalMaterialsController::class, 'index'])->name('admin.layout.exhibit.instructional_materials');
        Route::post('/exhibit/instructional-materials', [ExhibitInstructionalMaterialsController::class, 'update'])->name('admin.layout.exhibit.instructional_materials.update');
        Route::get('/exhibit/faculty-manual', [ExhibitFacultyManualController::class, 'index'])->name('admin.layout.exhibit.faculty_manual');
        Route::post('/exhibit/faculty-manual', [ExhibitFacultyManualController::class, 'update'])->name('admin.layout.exhibit.faculty_manual.update');
        Route::get('/exhibit/administrative-manual', [ExhibitAdministrativeManualController::class, 'index'])->name('admin.layout.exhibit.administrative_manual');
        Route::post('/exhibit/administrative-manual', [ExhibitAdministrativeManualController::class, 'update'])->name('admin.layout.exhibit.administrative_manual.update');
        Route::get('/exhibit/ched-memorandum-order', [ExhibitChedMemorandumOrderController::class, 'index'])->name('admin.layout.exhibit.ched_memorandum_order');
        Route::post('/exhibit/ched-memorandum-order', [ExhibitChedMemorandumOrderController::class, 'update'])->name('admin.layout.exhibit.ched_memorandum_order.update');
        Route::get('/exhibit/licensure', [ExhibitLicensureController::class, 'index'])->name('admin.layout.exhibit.licensure');
        Route::post('/exhibit/licensure', [ExhibitLicensureController::class, 'update'])->name('admin.layout.exhibit.licensure.update');
        Route::get('/exhibit/copc', [ExhibitCopcController::class, 'index'])->name('admin.layout.exhibit.copc');
        Route::post('/exhibit/copc', [ExhibitCopcController::class, 'update'])->name('admin.layout.exhibit.copc.update');
        Route::get('/exhibit/bor', [ExhibitBorController::class, 'index'])->name('admin.layout.exhibit.bor');
        Route::post('/exhibit/bor', [ExhibitBorController::class, 'update'])->name('admin.layout.exhibit.bor.update');
        Route::get('/exhibit/psv', [ExhibitPsvController::class, 'index'])->name('admin.layout.exhibit.psv');
        Route::post('/exhibit/psv', [ExhibitPsvController::class, 'update'])->name('admin.layout.exhibit.psv.update');
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

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
