import { submitContact } from "@/app/actions/commerce";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { getStoreSettings } from "@/lib/catalog/queries";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getStoreSettings();
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-2">
      <div>
        <h1 className="font-serif text-5xl">Contact</h1>
        <p className="mt-4 text-taupe">
          Write to the house. Messages are stored when the database is connected. Contact details below are configurable placeholders until the owner publishes live information.
        </p>
        <p className="mt-8 text-sm">{settings.contactEmail}</p>
        <p className="text-sm">{settings.contactPhone}</p>
      </div>
      <ActionForm action={submitContact} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" name="message" required />
        </div>
        <Button type="submit">Send</Button>
      </ActionForm>
    </div>
  );
}
