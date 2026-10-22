"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type MovimientoRow = {
  id: string;
  createdAt: string;
  quantity: number;
  comboId: string;
  comboTitle: string;
  beneficiary: string;
  token: string;
  scannedById: string;
  scannedByName: string;
  scannedByEmail: string;
};

function SortableHeader({
  column,
  label,
}: {
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
  label: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      onClick={() => column.toggleSorting(sorted === "asc")}
      className="inline-flex items-center gap-1 font-medium"
    >
      {label}
      <span className="text-xs text-gray-400">
        {sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : "↕"}
      </span>
    </button>
  );
}

export function MovimientosTable({
  rows,
  combos,
  users,
}: {
  rows: MovimientoRow[];
  combos: { id: string; title: string }[];
  users: { id: string; name: string }[];
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "fecha", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const setFilter = (id: string, value: unknown) =>
    setColumnFilters((prev) => {
      const rest = prev.filter((f) => f.id !== id);
      return value === undefined || value === ""
        ? rest
        : [...rest, { id, value }];
    });
  const getFilter = (id: string) =>
    (columnFilters.find((f) => f.id === id)?.value ?? {}) as {
      from?: string;
      to?: string;
    };

  const columns: ColumnDef<MovimientoRow>[] = [
    {
      id: "fecha",
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader column={column} label="Fecha" />,
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("es-AR"),
      filterFn: (row, _id, value: { from?: string; to?: string }) => {
        const t = new Date(row.original.createdAt).getTime();
        if (value.from && t < new Date(`${value.from}T00:00:00`).getTime())
          return false;
        if (value.to && t > new Date(`${value.to}T23:59:59.999`).getTime())
          return false;
        return true;
      },
    },
    {
      id: "hora",
      accessorKey: "createdAt",
      enableSorting: false,
      header: "Hora",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      id: "combo",
      accessorKey: "comboTitle",
      header: ({ column }) => <SortableHeader column={column} label="Combo" />,
    },
    {
      id: "comboId",
      accessorKey: "comboId",
      enableHiding: true,
      filterFn: "equalsString",
    },
    {
      id: "beneficiary",
      accessorKey: "beneficiary",
      header: ({ column }) => (
        <SortableHeader column={column} label="Beneficiario" />
      ),
    },
    {
      id: "token",
      accessorKey: "token",
      header: "QR",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-500">
          {row.original.token.slice(0, 10)}…
        </span>
      ),
    },
    {
      id: "quantity",
      accessorKey: "quantity",
      header: ({ column }) => <SortableHeader column={column} label="Cant." />,
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.quantity}</span>
      ),
    },
    {
      id: "scannedBy",
      accessorKey: "scannedByName",
      header: ({ column }) => (
        <SortableHeader column={column} label="Entregado por" />
      ),
      cell: ({ row }) => (
        <span title={row.original.scannedByEmail}>
          {row.original.scannedByName}
        </span>
      ),
    },
    {
      id: "scannedById",
      accessorKey: "scannedById",
      enableHiding: true,
      filterFn: "equalsString",
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  const filtered = table.getFilteredRowModel().rows;
  const totalQty = filtered.reduce((s, r) => s + r.original.quantity, 0);
  const dateRange = getFilter("fecha");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar texto, hora, QR…"
          className="input col-span-2"
        />
        <select
          value={
            (columnFilters.find((f) => f.id === "comboId")?.value as string) ??
            ""
          }
          onChange={(e) => setFilter("comboId", e.target.value)}
          className="input"
        >
          <option value="">Todos los combos</option>
          {combos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          value={
            (columnFilters.find((f) => f.id === "scannedById")
              ?.value as string) ?? ""
          }
          onChange={(e) => setFilter("scannedById", e.target.value)}
          className="input"
        >
          <option value="">Todos los usuarios</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-gray-500">
          Desde
          <input
            type="date"
            value={dateRange.from ?? ""}
            onChange={(e) =>
              setFilter("fecha", { ...dateRange, from: e.target.value })
            }
            className="input"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-500">
          Hasta
          <input
            type="date"
            value={dateRange.to ?? ""}
            onChange={(e) =>
              setFilter("fecha", { ...dateRange, to: e.target.value })
            }
            className="input"
          />
        </label>
      </div>

      <p className="text-sm text-gray-500">
        {filtered.length} movimientos ·{" "}
        <strong className="text-gray-900">{totalQty}</strong> combos entregados
      </p>

      <div className="rounded-xl bg-white ring-1 ring-gray-200">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-gray-400"
                >
                  No hay movimientos que coincidan con los filtros.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {Math.max(1, table.getPageCount())}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
