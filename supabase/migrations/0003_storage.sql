insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public_read_product_images" on storage.objects;
create policy "public_read_product_images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "no_public_uploads" on storage.objects;
-- Uploads are performed with the service role from the server.
create policy "no_public_uploads"
on storage.objects for insert
with check (false);
