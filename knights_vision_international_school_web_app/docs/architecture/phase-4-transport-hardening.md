# Phase 4E: Transport Hardening

**Status:** Deployed in the application layer.  
**Scope:** Fleet vehicles, depots, vehicle documents, and maintenance logs used by the Administration and Faculties panels.

## Access policy

- `transport.read` is required for every transport read.
- `transport.manage` is required for every transport create, update, or delete.
- The seeded `COE` and `TRANSPORT_MANAGER` roles have both permissions. System administrators retain full access. A normal teacher has neither transport permission.
- The same authorization is enforced for Administration and Faculties sessions. A user can use the Faculty panel only when their role grants the relevant transport permission.

## Protected records and validation

1. Vehicle writes now allow only known FleetVehicle fields. Required identity, compliance, lifecycle, date, enum, capacity, driver, and depot values are validated server-side.
2. Driver and depot assignments are resolved against canonical database records; browser-supplied nonexistent relations are rejected.
3. Vehicle-document writes validate the vehicle, document type, and HTTP(S) URL. The recorded uploader is derived from the authenticated user, not supplied by the browser.
4. Maintenance writes validate the vehicle, service data, dates, odometer, and cost. Invalid IDs, malformed requests, duplicate vehicle identifiers, and foreign-key-protected deletes return safe 4xx responses.
5. Vehicle detail responses expose only a safe driver projection; they never return the driver account's password, tokens, or payroll data.

## Compatibility controls

The active MUI panels were not redesigned. Existing paths now share the same protected implementation:

- canonical fleet URLs: `/api/fleets_management/*`;
- existing depot URLs: `/api/depots/*` and `/api/fleets_management/depot/*`;
- existing panel URLs: `/api-schools-panel/depots/*` and `/api-schools-panel/fleets_management/*`;
- short panel aliases restored for the existing screens: `/api/fleet-vehicles`, `/api/maintenance-logs/*`, and `/api/vehicle-documents/*`.

The `/api/vehicle-documents` panel alias previously pointed at a generic file-storage implementation even though the screen expected `VehicleDocument` records. It now resolves to the intended, protected fleet-document resource. Generic file storage remains in its own API family.

## Branch ownership and child-record enforcement

`Depot` and `FleetVehicle` now have required canonical `schoolId` and
`branchId` ownership. The migration was applied after confirming the live
database had zero transport rows, so no old record was guessed into a branch.
New depot and vehicle registration uses an explicit branch selector; the API
derives the school from that branch and filters both collections by the
authenticated user's scope.

Documents and maintenance logs inherit their scope from the parent vehicle.
Their collection reads filter through that vehicle, and every detail read,
update, and delete resolves the existing child record and verifies the parent
vehicle's school/branch scope before doing anything. Browser-supplied vehicle
IDs are likewise checked before a create or reassignment.

## Verification

- all 25 transport routes and compatibility wrappers have a shared RBAC guard or delegate to a guarded canonical handler;
- no unauthenticated fleet, depot, vehicle-document, maintenance, or short-alias request succeeded (`401`);
- system administration reads returned `200` for every canonical and tested compatibility URL;
- a normal teacher received `403` for fleet, depot, vehicle-document, and maintenance reads, and for an attempted depot mutation;
- malformed protected depot and maintenance writes returned `400` without creating records;
- focused TypeScript checks produced no diagnostics for the transport routes; the Administration panel stayed reachable at `/administration`.
