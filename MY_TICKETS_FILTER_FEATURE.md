# My Tickets Filter Feature Documentation

## Overview
This feature allows users to filter their tickets between "All My Tickets" and "Only Tickets from Active Organization" with URL persistence using nuqs.

## Implementation Summary

### 1. **Search Params Configuration** (`search-params.ts`)
Added a new filter parameter using `parseAsStringLiteral`:

```typescript
export const filterParser = parseAsStringLiteral([
  "all",
  "organization",
] as const)
  .withDefault("all")
  .withOptions({
    shallow: false,
    clearOnDefault: true,
  });
```

The filter is included in the `searchParamsCache` alongside search, sort, and pagination parameters.

### 2. **Filter Tabs Component** (`ticket-filter-tabs.tsx`)
A client component that renders a tabbed interface using the shadcn/ui Tabs component:

- Uses `useQueryState` hook from nuqs to manage the filter state
- Syncs with URL parameters automatically
- Two tabs: "All My Tickets" (default) and "Active Organization"
- Follows the same pattern as other ticket components (TicketSearchInput, TicketSortSelect)

### 3. **Ticket Count Display** (`ticket-list.tsx`)
Enhanced the ticket list to show a count of filtered vs total tickets:

- Displays "Showing X of Y tickets" when filtering
- Only shows count when viewing user's own tickets (userId is present)
- Positioned above the ticket items

### 4. **Get Tickets Query Enhancement** (`get-tickets.ts`)
Updated to return both filtered count and total count:

```typescript
const [tickets, count, totalCount] = await prisma.$transaction([
  // ... find tickets with filters
  // ... count with filters
  prisma.ticket.count({
    where: { userId }, // total without search/org filters
  }),
]);
```

Returns metadata with both `count` (filtered) and `totalCount` (all user tickets).

### 5. **Page Integration** (`tickets/page.tsx`)
- Added `TicketFilterTabs` component to the page
- Parses the filter parameter from search params
- Converts filter value to boolean: `byOrganization = filter === "organization"`
- Passes the boolean to TicketList component

### 6. **Pagination Reset** (`ticket-pagination.tsx`)
Added filter to reactive effects:

- Resets pagination to page 0 when filter changes
- Follows the same pattern as search parameter reset
- Uses `useRef` to track previous filter value

## Files Created
- `src/features/ticket/components/ticket-filter-tabs.tsx`

## Files Modified
- `src/features/ticket/search-params.ts` - Added filter parser
- `src/features/ticket/components/ticket-list.tsx` - Added count display
- `src/features/ticket/components/ticket-pagination.tsx` - Added filter reactive effect
- `src/features/ticket/queries/get-tickets.ts` - Added totalCount to metadata
- `src/app/(authenticated)/tickets/page.tsx` - Integrated filter tabs and logic

## Features Implemented

### ✅ Required
- Toggle between "All My Tickets" and "Active Organization"
- Default to "All My Tickets"
- Proper filtering logic using existing `byOrganization` parameter

### ✅ Bonus Features
- **URL Persistence**: Filter state persists in URL using nuqs
- **Styled UI**: Uses existing Tabs component matching app design
- **Ticket Count**: Shows "Showing X of Y tickets" when filtering
- **Pagination Reset**: Automatically resets to first page when filter changes

## Usage

Users can:
1. Navigate to "My Tickets" page
2. See all their tickets by default
3. Click "Active Organization" tab to filter tickets by their active organization
4. See the count update: "Showing 3 of 8 tickets" (example)
5. Switch back to "All My Tickets" to see all tickets again
6. URL updates automatically (e.g., `?filter=organization`)
7. Refresh the page and the filter persists

## Technical Details

- **State Management**: nuqs library with `parseAsStringLiteral`
- **UI Component**: shadcn/ui Tabs
- **Database**: Single transaction with multiple counts for efficiency
- **Type Safety**: Strongly typed filter values ("all" | "organization")
- **Patterns**: Follows existing patterns from search, sort, and pagination features

## Testing Checklist

✅ All tickets show by default  
✅ Switching to "Active Organization" filters correctly  
✅ Toggle back and forth works without errors  
✅ URL updates with filter parameter  
✅ Page refresh preserves filter state  
✅ Count displays correctly  
✅ Pagination resets when filter changes  
✅ Works with search and sort simultaneously