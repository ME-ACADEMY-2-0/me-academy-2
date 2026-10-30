import Link from "next/link";
import { ArrowDownRight, Banknote, ReceiptText, TicketPercent, Wallet } from "lucide-react";
import { PageHead, Stat, Status } from "@/components/dash/ui";
import { BarChart } from "@/components/dash/BarChart";
import { requireAdmin } from "@/lib/admin";
import { monthLabel } from "@/lib/data/admin";
import { compactMoney, formatMoney } from "@/lib/format";

export const metadata = { title: "Financials" };

export default async function Financials() {
  const { db } = await requireAdmin("financials");
  const [{ data: monthly }, { data: totals }, { data: recent }] = await Promise.all([
    db.rpc("admin_monthly_revenue", { p_months: 12 }),
    db.from("payments").select("amount_minor, discount_minor, status, course_id, course:courses(title)"),
    db
      .from("payments")
      .select("id, amount_minor, currency, status, provider, reference, paid_at, created_at, buyer:profiles!payments_user_id_fkey(full_name), course:courses(title)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const ok = (totals ?? []).filter((p) => p.status === "success");
  const gross = ok.reduce((n, p) => n + p.amount_minor, 0);
  const discounts = ok.reduce((n, p) => n + p.discount_minor, 0);
  const refunded = (totals ?? []).filter((p) => p.status === "refunded").reduce((n, p) => n + p.amount_minor, 0);
  const months = monthly ?? [];
  const thisMonth = months.at(-1)?.gross_minor ?? 0;

  // Best-selling courses by revenue.
  const byCourse = new Map<string, { title: string; sales: number; revenue: number }>();
  for (const p of ok) {
    if (!p.course_id) continue;
    const row = byCourse.get(p.course_id) ?? { title: p.course?.title ?? "Course", sales: 0, revenue: 0 };
    row.sales += 1;
    row.revenue += p.amount_minor;
    byCourse.set(p.course_id, row);
  }
  const top = [...byCourse.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8);

  return (
    <div className="et-page">
      <PageHead title="Financials" sub="Course sales, coupons and refunds.">
        <Link href="/admin/financials/payments" className="et-btn et-btn-ghost">
          All payments
        </Link>
      </PageHead>

      <div className="et-stats" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))" }}>
        <Stat label="Gross revenue" value={compactMoney(gross)} icon={Wallet} />
        <Stat label="This month" value={compactMoney(thisMonth)} icon={Banknote} />
        <Stat label="Sales" value={ok.length} icon={ReceiptText} />
        <Stat label="Coupon discounts" value={compactMoney(discounts)} icon={TicketPercent} />
        <Stat label="Refunded" value={compactMoney(refunded)} icon={ArrowDownRight} />
      </div>

      <section className="et-card">
        <div className="et-card-head">
          <h2>Gross revenue by month</h2>
        </div>
        <BarChart
          data={months.map((m) => ({
            label: monthLabel(m.month),
            value: m.gross_minor,
            tip: `${monthLabel(m.month)}: ${formatMoney(m.gross_minor)} from ${m.sales} ${m.sales === 1 ? "sale" : "sales"}`,
          }))}
          format={compactMoney}
          height={200}
        />
      </section>

      <div className="et-grid-2">
        <section className="et-card">
          <div className="et-card-head">
            <h2>Recent payments</h2>
            <Link href="/admin/financials/payments">See all</Link>
          </div>
          {recent?.length ? (
            <table className="et-table">
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <b>{p.buyer?.full_name || "Unknown buyer"}</b>
                      <small>{p.course?.title ?? "Sale"}</small>
                    </td>
                    <td className="et-money et-td-right">{formatMoney(p.amount_minor, p.currency)}</td>
                    <td>
                      <Status value={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="et-empty">No payments yet. Record bank transfers under All payments.</p>
          )}
        </section>
        <section className="et-card">
          <div className="et-card-head">
            <h2>Top courses</h2>
          </div>
          {top.length ? (
            <table className="et-table">
              <tbody>
                {top.map(([id, c]) => (
                  <tr key={id}>
                    <td>
                      <Link href={`/admin/courses/${id}`}>
                        <b>{c.title}</b>
                      </Link>
                      <small>
                        {c.sales} {c.sales === 1 ? "sale" : "sales"}
                      </small>
                    </td>
                    <td className="et-money et-td-right">{formatMoney(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="et-empty">No course sales yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
