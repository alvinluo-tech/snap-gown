import { getAdminOrders } from "@/app/actions/verification";
import { AdminOrdersClient } from "./AdminOrdersClient";
import COPY from "@/lib/constants/copy";

export default async function AdminOrdersPage() {
  let orders;
  try {
    orders = await getAdminOrders();
  } catch {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{COPY.ADMIN.FAILED_TO_LOAD}</p>
      </div>
    );
  }

  return (
    <AdminOrdersClient
      orders={(orders || []).map((o) => ({
        ...o,
        availability_slots: o.availability_slots as unknown as {
          slot_date: string;
          start_time: string;
          end_time: string;
        },
        student: o.student as unknown as { full_name: string; wechat_id: string },
        photographer: o.photographer as unknown as { full_name: string },
      }))}
    />
  );
}
