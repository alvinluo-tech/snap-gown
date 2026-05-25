"use client";

import { useState, useMemo } from "react";
import { penceToPounds } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users } from "lucide-react";
import COPY from "@/lib/constants/copy";

interface StudentProfile {
  id: string;
  full_name: string;
  wechat_id: string;
  uk_phone: string | null;
  updated_at: string | null;
  orderCount: number;
  totalSpentPence: number;
}

export function StudentsClient({ students }: { students: StudentProfile[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return students;
    const term = search.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(term) ||
        s.wechat_id.toLowerCase().includes(term) ||
        (s.uk_phone && s.uk_phone.toLowerCase().includes(term))
    );
  }, [students, search]);

  const totalOrders = students.reduce((sum, s) => sum + s.orderCount, 0);
  const totalRevenue = students.reduce(
    (sum, s) => sum + s.totalSpentPence,
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{COPY.ADMIN.STUDENTS_TITLE}</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {COPY.ADMIN.TOTAL_STUDENTS}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {COPY.ADMIN.ORDERS_COUNT}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {COPY.ADMIN.TOTAL_REVENUE}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              £{penceToPounds(totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={COPY.ADMIN.SEARCH_STUDENTS}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{COPY.ADMIN.STUDENTS_TITLE} ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {search
                ? COPY.ADMIN.NO_STUDENTS_MATCH
                : COPY.ADMIN.NO_STUDENTS_REGISTERED}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{COPY.COMMON.NAME}</TableHead>
                    <TableHead>{COPY.COMMON.WECHAT}</TableHead>
                    <TableHead>{COPY.COMMON.PHONE}</TableHead>
                    <TableHead>{COPY.ADMIN.ORDERS_COUNT}</TableHead>
                    <TableHead>{COPY.ADMIN.TOTAL_SPENT}</TableHead>
                    <TableHead>{COPY.ADMIN.LAST_ACTIVE}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.full_name}
                      </TableCell>
                      <TableCell>{student.wechat_id}</TableCell>
                      <TableCell>{student.uk_phone || "-"}</TableCell>
                      <TableCell>{student.orderCount}</TableCell>
                      <TableCell>
                        £{penceToPounds(student.totalSpentPence)}
                      </TableCell>
                      <TableCell>
                        {student.updated_at
                          ? new Date(student.updated_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
