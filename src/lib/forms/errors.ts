import type { ZodError } from "zod";

const LIBRARY_MESSAGE = /too big|too small|expected |invalid (input|type|string|enum|option)|received |unrecognized keys/i;

export type FieldErrors = Record<string, string>;

export type FormState = {
  error?: string;
  fields?: FieldErrors;
  focus?: string;
  ok?: boolean;
  message?: string;
};

export function plainValidationMessage(field: string, message: string, maximum?: number) {
  if (message && !LIBRARY_MESSAGE.test(message)) return message;
  if (field === "quantity") {
    if (typeof maximum === "number" && /too big|<=|at most|exceed/i.test(message)) {
      return `You can order up to ${maximum} of this item.`;
    }
    if (/too big|<=|exceed/i.test(message)) return "You can order up to 6 of this item.";
    return "Quantity must be at least 1.";
  }
  if (field === "email") return "Enter a valid email address.";
  if (field === "password") return "Password must be at least 8 characters.";
  if (field === "fullName" || field === "name") return "Enter your name.";
  if (field === "phone") return "Enter a valid phone number.";
  if (field === "message") return "Enter a message of at least 10 characters.";
  if (field === "region") return "Choose a region.";
  if (field === "locality") return "Enter your town or area.";
  if (field === "addressLine") return "Enter your address.";
  if (field === "deliveryMethodId") return "Choose a delivery method.";
  if (field === "query") return "Enter the phone number from checkout, or an order number such as ELF-….";
  return "Please check this field.";
}

export function validationState(error: ZodError): FormState {
  const fields: FieldErrors = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (!field || fields[field]) continue;
    const maximum = "maximum" in issue && typeof issue.maximum === "number" ? issue.maximum : undefined;
    fields[field] = plainValidationMessage(field, issue.message, maximum);
  }
  const focus = String(error.issues[0]?.path[0] ?? "");
  return {
    fields,
    focus,
    error: (focus && fields[focus]) || "Please check your details.",
  };
}

export function customerCheckoutError(message: string) {
  if (/^Only \d+ of /.test(message) || /out of stock/i.test(message)) return message;
  if (LIBRARY_MESSAGE.test(message)) return "Please check your details.";
  if (/operator does not exist|violates|syntax error|PGRST|duplicate key|password authentication/i.test(message)) {
    return "We could not place the order. Please try again.";
  }
  return message;
}
