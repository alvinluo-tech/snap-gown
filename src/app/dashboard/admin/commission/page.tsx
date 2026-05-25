import { getAdminCommissionLedger } from "@/app/actions/verification";
import { CommissionClient } from "./CommissionClient";
import COPY from "@/lib/constants/copy";

export default async function CommissionPage() {
  let ledger;
  try {
    ledger = await getAdminCommissionLedger();
  } catch {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{COPY.ADMIN.FAILED_TO_LOAD}</p>
      </div>
    );
  }

  return <CommissionClient ledger={ledger as unknown as CommissionEntry[]} />;
}

interface CommissionEntry {
  id: string;
  order_id: string;
  photographer_id: string;
  platform_fee_pence: number;
  ledger_status: string;
  settled_at: string | null;
  settled_by: string | null;
  note: string | null;
  created_at: string | null;
  photographer: { full_name: string } | null;
  order: { order_no: string; total_amount_pence: number } | null;
}
