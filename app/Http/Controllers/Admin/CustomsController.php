<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComplianceDocument;
use App\Models\CustomsDeclaration;
use App\Models\CustomsItem;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomsController extends Controller
{
    /**
     * Display customs management dashboard.
     */
    public function index(Request $request)
    {
        $query = CustomsDeclaration::with(['shipment', 'createdBy'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('declaration_number', 'like', "%{$search}%")
                    ->orWhere('customs_reference', 'like', "%{$search}%")
                    ->orWhereHas('shipment', function ($q) use ($search) {
                        $q->where('tracking_number', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('declaration_type')) {
            $query->where('declaration_type', $request->declaration_type);
        }

        if ($request->filled('country')) {
            $query->where(function ($q) use ($request) {
                $q->where('origin_country', $request->country)
                    ->orWhere('destination_country', $request->country);
            });
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to.' 23:59:59');
        }

        $declarations = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total_declarations' => CustomsDeclaration::count(),
            'pending_declarations' => CustomsDeclaration::pending()->count(),
            'cleared_today' => CustomsDeclaration::where('cleared_at', '>=', today())->count(),
            'high_value_declarations' => CustomsDeclaration::highValue()->count(),
            'avg_processing_time' => $this->getAverageProcessingTime(),
            'compliance_rate' => $this->getComplianceRate(),
        ];

        return Inertia::render('Admin/Customs/Index', [
            'declarations' => $declarations,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'declaration_type', 'country', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show customs declaration details.
     */
    public function show(CustomsDeclaration $declaration)
    {
        $declaration->load([
            'shipment.customer',
            'items',
            'documents.uploadedBy',
            'createdBy',
        ]);

        $complianceStatus = $declaration->getComplianceStatus();

        return Inertia::render('Admin/Customs/Show', [
            'declaration' => $declaration,
            'complianceStatus' => $complianceStatus,
        ]);
    }

    /**
     * Create new customs declaration.
     */
    public function create(Request $request)
    {
        $shipment = null;
        if ($request->filled('shipment_id')) {
            $shipment = Shipment::with(['customer', 'originWarehouse', 'destinationWarehouse'])->find($request->shipment_id);
        }

        $pendingShipments = Shipment::whereDoesntHave('customsDeclaration')
            ->whereIn('status', ['pending', 'picked_up'])
            ->with(['customer', 'destinationWarehouse'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return Inertia::render('Admin/Customs/Create', [
            'shipment' => $shipment,
            'pendingShipments' => $pendingShipments,
        ]);
    }

    /**
     * Store new customs declaration.
     */
    public function store(Request $request)
    {
        $request->validate([
            'shipment_id' => 'required|exists:shipments,id',
            'declaration_type' => 'required|in:export,import,transit',
            'shipment_type' => 'required|in:commercial,gift,sample,return,personal',
            'origin_country' => 'required|string|size:3',
            'destination_country' => 'required|string|size:3',
            'currency' => 'required|string|size:3',
            'total_value' => 'required|numeric|min:0',
            'description_of_goods' => 'required|string|max:1000',
            'exporter_details' => 'required|array',
            'importer_details' => 'required|array',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_value' => 'required|numeric|min:0',
            'items.*.unit_weight' => 'required|numeric|min:0',
            'items.*.country_of_origin' => 'required|string|size:3',
        ]);

        DB::beginTransaction();

        try {
            // Create customs declaration
            $declaration = CustomsDeclaration::create([
                'shipment_id' => $request->shipment_id,
                'declaration_type' => $request->declaration_type,
                'shipment_type' => $request->shipment_type,
                'origin_country' => $request->origin_country,
                'destination_country' => $request->destination_country,
                'currency' => $request->currency,
                'total_value' => $request->total_value,
                'insurance_value' => $request->insurance_value ?? 0,
                'freight_charges' => $request->freight_charges ?? 0,
                'description_of_goods' => $request->description_of_goods,
                'reason_for_export' => $request->reason_for_export,
                'contains_batteries' => $request->contains_batteries ?? false,
                'contains_liquids' => $request->contains_liquids ?? false,
                'contains_dangerous_goods' => $request->contains_dangerous_goods ?? false,
                'dangerous_goods_details' => $request->dangerous_goods_details,
                'exporter_details' => $request->exporter_details,
                'importer_details' => $request->importer_details,
                'consignee_details' => $request->consignee_details,
                'incoterms' => $request->incoterms,
                'created_by' => auth()->id(),
            ]);

            // Create customs items
            foreach ($request->items as $itemData) {
                CustomsItem::create([
                    'customs_declaration_id' => $declaration->id,
                    'description' => $itemData['description'],
                    'hs_code' => $itemData['hs_code'] ?? null,
                    'country_of_origin' => $itemData['country_of_origin'],
                    'quantity' => $itemData['quantity'],
                    'unit_of_measure' => $itemData['unit_of_measure'] ?? 'piece',
                    'unit_weight' => $itemData['unit_weight'],
                    'unit_value' => $itemData['unit_value'],
                    'currency' => $request->currency,
                    'manufacturer' => $itemData['manufacturer'] ?? null,
                    'brand' => $itemData['brand'] ?? null,
                    'model' => $itemData['model'] ?? null,
                    'material' => $itemData['material'] ?? null,
                    'purpose' => $itemData['purpose'] ?? null,
                ]);
            }

            // Calculate estimated charges
            $declaration->calculateEstimatedCharges();

            DB::commit();

            return redirect()
                ->route('admin.customs.show', $declaration)
                ->with('success', 'Customs declaration created successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to create customs declaration'])
                ->withInput();
        }
    }

    /**
     * Submit declaration for processing.
     */
    public function submit(CustomsDeclaration $declaration)
    {
        if (! $declaration->isComplete()) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Declaration is incomplete. Please ensure all required fields and documents are provided.']);
        }

        $declaration->submit();

        return redirect()
            ->route('admin.customs.show', $declaration)
            ->with('success', 'Declaration submitted for processing');
    }

    /**
     * Approve declaration.
     */
    public function approve(Request $request, CustomsDeclaration $declaration)
    {
        $request->validate([
            'customs_reference' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $customsResponse = [
            'approved_by' => auth()->user()->name,
            'approved_at' => now()->toISOString(),
            'customs_reference' => $request->customs_reference,
            'notes' => $request->notes,
        ];

        $declaration->approve($customsResponse);

        return redirect()
            ->route('admin.customs.show', $declaration)
            ->with('success', 'Declaration approved successfully');
    }

    /**
     * Reject declaration.
     */
    public function reject(Request $request, CustomsDeclaration $declaration)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $declaration->reject($request->rejection_reason);

        return redirect()
            ->route('admin.customs.show', $declaration)
            ->with('success', 'Declaration rejected');
    }

    /**
     * Clear declaration through customs.
     */
    public function clear(Request $request, CustomsDeclaration $declaration)
    {
        $request->validate([
            'customs_reference' => 'required|string',
        ]);

        $declaration->clear($request->customs_reference);

        return redirect()
            ->route('admin.customs.show', $declaration)
            ->with('success', 'Declaration cleared through customs');
    }

    /**
     * Upload compliance document.
     */
    public function uploadDocument(Request $request, CustomsDeclaration $declaration)
    {
        $request->validate([
            'document_type' => 'required|string',
            'document_name' => 'required|string|max:255',
            'file' => 'required|file|max:10240', // 10MB max
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after:issue_date',
            'issued_by' => 'nullable|string|max:255',
            'reference_number' => 'nullable|string|max:255',
        ]);

        try {
            $file = $request->file('file');
            $fileName = time().'_'.$file->getClientOriginalName();
            $filePath = $file->storeAs('compliance_documents', $fileName);

            ComplianceDocument::create([
                'shipment_id' => $declaration->shipment_id,
                'customs_declaration_id' => $declaration->id,
                'document_type' => $request->document_type,
                'document_name' => $request->document_name,
                'file_path' => $filePath,
                'file_name' => $fileName,
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'issue_date' => $request->issue_date,
                'expiry_date' => $request->expiry_date,
                'issued_by' => $request->issued_by,
                'reference_number' => $request->reference_number,
                'is_required' => in_array($request->document_type, $declaration->getRequiredDocuments()),
                'uploaded_by' => auth()->id(),
            ]);

            return redirect()
                ->route('admin.customs.show', $declaration)
                ->with('success', 'Document uploaded successfully');

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to upload document']);
        }
    }

    /**
     * Get compliance check results.
     */
    public function complianceCheck(CustomsDeclaration $declaration)
    {
        $complianceStatus = $declaration->getComplianceStatus();

        $itemChecks = [];
        foreach ($declaration->items as $item) {
            $itemChecks[] = [
                'item' => $item,
                'restrictions' => $item->checkRestrictions(),
            ];
        }

        return response()->json([
            'declaration_compliance' => $complianceStatus,
            'item_compliance' => $itemChecks,
        ]);
    }

    /**
     * Get average processing time.
     */
    private function getAverageProcessingTime(): float
    {
        $declarations = CustomsDeclaration::whereNotNull('submitted_at')
            ->whereNotNull('cleared_at')
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        if ($declarations->isEmpty()) {
            return 0;
        }

        $totalHours = 0;
        foreach ($declarations as $declaration) {
            $totalHours += $declaration->submitted_at->diffInHours($declaration->cleared_at);
        }

        return round($totalHours / $declarations->count(), 1);
    }

    /**
     * Get compliance rate.
     */
    private function getComplianceRate(): float
    {
        $totalDeclarations = CustomsDeclaration::where('created_at', '>=', now()->subDays(30))->count();

        if ($totalDeclarations === 0) {
            return 0;
        }

        $compliantDeclarations = CustomsDeclaration::where('created_at', '>=', now()->subDays(30))
            ->where('status', 'cleared')
            ->count();

        return round(($compliantDeclarations / $totalDeclarations) * 100, 1);
    }
}
