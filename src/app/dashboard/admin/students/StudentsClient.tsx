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
import { Search, Users, GraduationCap, DollarSign } from "lucide-react";
import COPY from "@/lib/constants/copy";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-serif italic font-bold text-primary tracking-tight">
          {COPY.ADMIN.STUDENTS_TITLE}
        </h1>
        <p className="text-xs text-muted-foreground">
          查看并检索在平台注册的毕业学生档案及订单累计流水
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-lift border border-border/80 bg-card rounded-2xl overflow-hidden shadow-xs relative p-1">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              {COPY.ADMIN.TOTAL_STUDENTS}
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
              <Users className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-mono font-bold text-primary">{students.length}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift border border-border/80 bg-card rounded-2xl overflow-hidden shadow-xs relative p-1">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              {COPY.ADMIN.ORDERS_COUNT}
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
              <GraduationCap className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-mono font-bold text-primary">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="hover-lift border border-border/80 bg-card rounded-2xl overflow-hidden shadow-xs relative p-1">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              {COPY.ADMIN.TOTAL_REVENUE}
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
              <DollarSign className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-2xl font-mono font-bold text-brand-foreground">
              £{penceToPounds(totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Input bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder={COPY.ADMIN.SEARCH_STUDENTS}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10.5 rounded-xl border-border/85 bg-card/60 focus:bg-card transition-colors h-10 text-xs"
        />
      </div>

      {/* Students List Table */}
      <Card className="border border-border/80 rounded-[24px] overflow-hidden shadow-xs bg-card">
        <CardHeader className="p-6 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-serif italic font-bold text-primary">
            {COPY.ADMIN.STUDENTS_TITLE} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-xs p-10 text-center">
              {search
                ? COPY.ADMIN.NO_STUDENTS_MATCH
                : COPY.ADMIN.NO_STUDENTS_REGISTERED}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-serif italic font-bold text-primary pl-8">{COPY.COMMON.NAME}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.WECHAT}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.COMMON.PHONE}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.ADMIN.ORDERS_COUNT}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary">{COPY.ADMIN.TOTAL_SPENT}</TableHead>
                    <TableHead className="font-serif italic font-bold text-primary pr-8">{COPY.ADMIN.LAST_ACTIVE}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-semibold text-xs text-primary pl-8">
                        {student.full_name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{student.wechat_id}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{student.uk_phone || "-"}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-primary">{student.orderCount}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        £{penceToPounds(student.totalSpentPence)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground pr-8">
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
