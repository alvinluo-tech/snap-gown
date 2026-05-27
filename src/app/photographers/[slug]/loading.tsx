import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function PhotographerLoading() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden academic-grain pb-24">
      {/* Ambient background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[100px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary/5 blur-[100px] rounded-full pointer-events-none animate-pulse" />

      {/* Header Skeleton */}
      <header className="academic-glass sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="h-9 w-9 bg-muted/80 rounded-xl animate-pulse" />
          <div className="h-6 w-32 bg-muted/80 rounded-md animate-pulse" />
          <div className="h-5 w-24 bg-muted/80 rounded-full animate-pulse" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12 relative z-10">
        {/* Photographer Card Skeleton */}
        <Card className="border border-border/80 bg-card rounded-[24px] overflow-hidden p-4 shadow-xs relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand/35 animate-pulse" />
          <CardHeader className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full">
                {/* Avatar skeleton */}
                <div className="h-20 w-20 rounded-2xl bg-muted/70 border border-border/40 shrink-0 animate-pulse" />
                <div className="space-y-3 text-center sm:text-left w-full sm:max-w-md">
                  <div className="h-8 w-40 bg-muted/80 rounded-md mx-auto sm:mx-0 animate-pulse" />
                  <div className="h-5 w-24 bg-muted/80 rounded-full mx-auto sm:mx-0 animate-pulse" />
                </div>
              </div>
              <div className="h-14 w-28 bg-muted/70 rounded-xl shrink-0 animate-pulse" />
            </div>
            <div className="space-y-2.5 pt-2">
              <div className="h-4 w-full bg-muted/70 rounded-md animate-pulse" />
              <div className="h-4 w-[85%] bg-muted/70 rounded-md animate-pulse" />
            </div>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8 pt-0 border-t border-border/40 space-y-4">
            <div className="space-y-2.5">
              <div className="h-3.5 w-24 bg-muted/65 rounded-md animate-pulse" />
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-28 bg-muted/70 rounded-lg animate-pulse" />
                <div className="h-6 w-24 bg-muted/70 rounded-lg animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Scheduler Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-4">
            <div className="h-8 w-48 bg-muted/85 rounded-md animate-pulse" />
            <div className="h-5 w-16 bg-muted/85 rounded-full animate-pulse" />
          </div>
          <Card className="border border-border/80 rounded-[24px] p-6 md:p-8 bg-card shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="h-6 w-32 bg-muted/80 rounded-md animate-pulse" />
                <div className="h-64 bg-muted/40 rounded-2xl animate-pulse" />
              </div>
              <div className="space-y-5">
                <div className="h-6 w-32 bg-muted/80 rounded-md animate-pulse" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-muted/30 rounded-xl animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
