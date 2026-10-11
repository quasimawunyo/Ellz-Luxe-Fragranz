import { getStoreSettings } from "@/lib/catalog/queries";
import { saveSettingsAction } from "@/app/actions/admin";
import { ActionForm } from "@/components/forms/form-status";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { cedisInputFromMinor } from "@/lib/money";

export const metadata = { title: "Settings · Admin" };

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-4xl">Store settings</h1>
      <ActionForm action={saveSettingsAction} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="announcement">Announcement</Label>
          <Input id="announcement" name="announcement" defaultValue={settings.announcement} />
        </div>
        <div>
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input id="contactEmail" name="contactEmail" defaultValue={settings.contactEmail} />
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact phone</Label>
          <Input id="contactPhone" name="contactPhone" defaultValue={settings.contactPhone} />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={settings.location} />
        </div>
        <div>
          <Label htmlFor="instagramUrl">Instagram URL</Label>
          <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl} />
        </div>
        <div>
          <Label htmlFor="tiktokUrl">TikTok URL</Label>
          <Input id="tiktokUrl" name="tiktokUrl" defaultValue={settings.tiktokUrl} />
        </div>
        <div>
          <Label htmlFor="snapchatHandle">Snapchat</Label>
          <Input id="snapchatHandle" name="snapchatHandle" defaultValue={settings.snapchatHandle} />
        </div>
        <div>
          <Label htmlFor="momoNumber">MoMo number</Label>
          <Input id="momoNumber" name="momoNumber" defaultValue={settings.momoNumber} />
        </div>
        <div>
          <Label htmlFor="momoMerchantId">MoMo merchant ID</Label>
          <Input id="momoMerchantId" name="momoMerchantId" defaultValue={settings.momoMerchantId} />
        </div>
        <div>
          <Label htmlFor="bankName">Bank</Label>
          <Input id="bankName" name="bankName" defaultValue={settings.bankName} />
        </div>
        <div>
          <Label htmlFor="bankAccount">Bank account</Label>
          <Input id="bankAccount" name="bankAccount" defaultValue={settings.bankAccount} />
        </div>
        <div>
          <Label htmlFor="aboutStory">About story</Label>
          <Textarea id="aboutStory" name="aboutStory" defaultValue={settings.aboutStory} />
        </div>
        <div>
          <Label htmlFor="shippingNote">Shipping note (shown on product pages)</Label>
          <Textarea id="shippingNote" name="shippingNote" defaultValue={settings.shippingNote} />
        </div>
        <div>
          <Label htmlFor="returnsNote">Returns note</Label>
          <Textarea id="returnsNote" name="returnsNote" defaultValue={settings.returnsNote} />
        </div>
        <h2 className="pt-4 font-serif text-2xl">Delivery fees (GH₵)</h2>
        <div>
          <Label htmlFor="deliveryAccraCedis">Greater Accra</Label>
          <Input
            id="deliveryAccraCedis"
            name="deliveryAccraCedis"
            type="number"
            min="0"
            step="0.01"
            defaultValue={cedisInputFromMinor(settings.deliveryMethods.find((method) => method.id === "accra")?.amountMinor ?? 3000)}
            required
          />
        </div>
        <div>
          <Label htmlFor="deliveryAccraNote">Greater Accra note</Label>
          <Input
            id="deliveryAccraNote"
            name="deliveryAccraNote"
            defaultValue={settings.deliveryMethods.find((method) => method.id === "accra")?.description ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="deliveryNationalCedis">Rest of Ghana</Label>
          <Input
            id="deliveryNationalCedis"
            name="deliveryNationalCedis"
            type="number"
            min="0"
            step="0.01"
            defaultValue={cedisInputFromMinor(settings.deliveryMethods.find((method) => method.id === "national")?.amountMinor ?? 5000)}
            required
          />
        </div>
        <div>
          <Label htmlFor="deliveryNationalNote">Rest of Ghana note</Label>
          <Input
            id="deliveryNationalNote"
            name="deliveryNationalNote"
            defaultValue={settings.deliveryMethods.find((method) => method.id === "national")?.description ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="deliveryPickupNote">Pickup note</Label>
          <Input
            id="deliveryPickupNote"
            name="deliveryPickupNote"
            defaultValue={settings.deliveryMethods.find((method) => method.id === "pickup")?.description ?? ""}
          />
        </div>
        <Button type="submit">Save</Button>
      </ActionForm>
    </div>
  );
}
