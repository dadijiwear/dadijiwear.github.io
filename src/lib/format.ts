export function formatPaymentStatus(status: string | null | undefined): string {
  switch (status) {
    case "CAPTURED":
      return "Paid";
    case "PENDING":
      return "Pending";
    case "AUTHORIZED":
      return "Authorized";
    case "FAILED":
      return "Failed";
    case "REFUNDED":
      return "Refunded";
    default:
      return status || "—";
  }
}
