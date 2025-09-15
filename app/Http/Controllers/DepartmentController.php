<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $departments = Department::query()
            ->withCount(['beds', 'doctors'])
            ->when($request->search, fn($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when($request->facility_id, fn($q, $id) => $q->where('facility_id', $id))
            ->paginate($request->per_page ?? 15);

        return DepartmentResource::collection($departments);
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = Department::create($request->validated());

        return response()->json(new DepartmentResource($department), 201);
    }

    public function show(Department $department): JsonResponse
    {
        return response()->json(new DepartmentResource($department->load(['beds', 'doctors'])));
    }

    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        $department->update($request->validated());

        return response()->json(new DepartmentResource($department));
    }

    public function destroy(Department $department): JsonResponse
    {
        $department->delete();

        return response()->json(null, 204);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'total_departments' => Department::count(),
                'departments_with_beds' => Department::has('beds')->count(),
                'departments_with_doctors' => Department::has('doctors')->count(),
            ]
        ]);
    }
}