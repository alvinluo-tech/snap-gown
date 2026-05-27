import { Card, CardContent } from "@/components/ui/card";

export default function StudentDashboardLoading() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden academic-grain pb-24">
      {/* Decorative top background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[100px] rounded-full pointer-events-none animate-pulse" />

      {/* Header */}
      <header className="academic-glass sticky top-0 z-50 transition-base border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="h-9 w-9 bg-muted/80 rounded-xl animate-pulse" />
          <div className="h-6 w-36 bg-muted/80 rounded-md animate-pulse" />
          <div className="h-5 w-24 bg-muted/80 rounded-full animate-pulse" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-8">
        
        {/* Title Group */}
        <div className="space-y-2">
          <div className="h-9 w-48 bg-muted/85 rounded-md animate-pulse" />
          <div className="h-4 w-72 bg-muted/70 rounded-md animate-pulse" />
        </div>

        {/* Dashboard table card wrapper skeleton */}
        <Card className="border border-border/80 rounded-[24px] overflow-hidden shadow-xs bg-card">
          <CardContent className="p-0 space-y-4">
            {/* Table Header skeleton */}
            <div className="bg-muted/30 border-b border-border/40 p-6 flex justify-between gap-4">
              <div className="h-5 w-20 bg-muted/80 rounded-sm animate-pulse" />
              <div className="h-5 w-24 bg-muted/80 rounded-sm animate-pulse" />
              <div className="h-5 w-28 bg-muted/80 rounded-sm animate-pulse" />
              <div className="h-5 w-20 bg-muted/80 rounded-sm animate-pulse" />
              <div className="h-5 w-16 bg-muted/80 rounded-sm animate-pulse" />
              <div className="h-5 w-16 bg-muted/80 rounded-sm animate-pulse" />
            </div>

            {/* Table Body skeletons */}
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-border/30 last:border-b-0 gap-4">
                  <div className="h-5 w-16 bg-muted/75 rounded-sm animate-pulse" />
                  <div className="h-6 w-24 bg-muted/75 rounded-md animate-pulse" />
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted/70 animate-pulse" />
                    <div className="h-5 w-20 bg-muted/70 rounded-sm animate-pulse" />
                  </div>
                  <div className="h-5 w-20 bg-muted/70 rounded-sm animate-pulse" />
                  <div className="h-5 w-16 bg-muted/70 rounded-sm animate-pulse" />
                  <div className="h-5 w-16 bg-muted/70 rounded-sm animate-pulse" />
                  <div className="h-6 w-16 bg-muted/70 rounded-full animate-pulse" />
                  <div className="h-8 w-20 bg-muted/75 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
