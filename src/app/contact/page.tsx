import { submitContact } from "@/app/actions/commerce";
import { ActionForm, FieldError } from "@/components/forms/form-status";
import { StoreContact, StoreSocials, WhatsAppCta } from "@/components/layout/store-details";
import { FormGuard } from "@/components/forms/form-guard";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { getStoreSettings } from "@/lib/catalog/queries";
import { pageMetadata } from "@/lib/seo";
import { PAGE_DESCRIPTIONS } from "@/lib/seo-copy";

export const metadata = pageMetadata({
  title: "Contact",
  description: PAGE_DESCRIPTIONS.contact,
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getStoreSettings();
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2">
      <div>
        <h1 className="font-serif text-4xl">Contact</h1>
        <p className="mt-4 text-taupe">Visit {settings.location}, call, or send a WhatsApp message.</p>
        <StoreContact settings={settings} className="mt-8 space-y-2 text-sm" />
        <div className="mt-6">
          <WhatsAppCta phone={settings.contactPhone} message="Hello, I have a question about EllzLuxe Fragranz." />
        </div>
        <h2 className="mt-10 text-lg font-semibold">Social</h2>
        <StoreSocials settings={settings} />
      </div>
      <ActionForm action={submitContact} className="relative space-y-4">
        <FormGuard />
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" />
          <FieldError name="name" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
          <FieldError name="phone" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" />
          <p className="mt-2 text-sm text-taupe">Enter a phone number or an email address.</p>
          <FieldError name="email" />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" name="message" required />
          <FieldError name="message" />
        </div>
        <Button type="submit" variant="shop" className="w-full px-8 sm:w-auto">
          Send
        </Button>
      </ActionForm>
    </div>
  );
}
