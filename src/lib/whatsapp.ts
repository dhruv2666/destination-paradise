export type TemplateValues = {
  name: string;
  car: string;
  from: string;
  to: string;
  total: string;
  link: string;
};

export const TEMPLATE_PLACEHOLDERS = ["{name}", "{car}", "{from}", "{to}", "{total}", "{link}"];

export function fillTemplate(template: string, values: TemplateValues): string {
  return template.replace(/\{(name|car|from|to|total|link)\}/g, (_, key: keyof TemplateValues) =>
    values[key] ?? "",
  );
}

/** wa.me wants the international number with digits only: no +, spaces or leading 00. */
export function whatsappNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  return digits;
}

export function whatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${whatsappNumber(phone)}?text=${encodeURIComponent(message)}`;
}
