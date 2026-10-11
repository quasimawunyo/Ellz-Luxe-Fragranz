export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: "customer" | "admin" | "super_admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "customer" | "admin" | "super_admin";
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
        };
      };
      categories: {
        Row: { id: string; slug: string; name: string; created_at: string };
        Insert: { id?: string; slug: string; name: string };
        Update: { slug?: string; name?: string };
      };
      collections: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          image_url?: string;
        };
        Update: Partial<Database["public"]["Tables"]["collections"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          brand: string;
          concentration: string | null;
          category_id: string;
          featured: boolean;
          status: "draft" | "published" | "archived";
          is_demonstration: boolean;
          top_notes: string[];
          heart_notes: string[];
          base_notes: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string;
          label: string;
          size_ml: number | null;
          price_minor: number;
          compare_at_minor: number | null;
          stock: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["product_variants"]["Row"], "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string;
          position: number;
        };
        Insert: Database["public"]["Tables"]["product_images"]["Row"] & { id?: string };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
      };
      collection_products: {
        Row: { collection_id: string; product_id: string };
        Insert: { collection_id: string; product_id: string };
        Update: never;
      };
      carts: {
        Row: { id: string; created_at: string; updated_at: string };
        Insert: { id?: string };
        Update: { updated_at?: string };
      };
      cart_items: {
        Row: { cart_id: string; variant_id: string; quantity: number };
        Insert: { cart_id: string; variant_id: string; quantity: number };
        Update: { quantity?: number };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          email: string;
          phone: string;
          region: string;
          locality: string;
          address_line: string;
        };
        Insert: Omit<Database["public"]["Tables"]["addresses"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          email: string;
          full_name: string;
          phone: string;
          region: string;
          locality: string;
          address_line: string;
          delivery_method: string;
          notes: string | null;
          currency_code: string;
          subtotal_minor: number;
          shipping_minor: number;
          total_minor: number;
          order_status: "open" | "completed" | "cancelled";
          payment_status: "pending" | "paid" | "failed" | "refunded";
          fulfillment_status: "unfulfilled" | "processing" | "shipped" | "delivered" | "cancelled";
          tracking_number: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_name: string;
          sku: string;
          variant_label: string;
          quantity: number;
          unit_price_minor: number;
          product_id: string | null;
          variant_id: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id"> & { id?: string };
        Update: never;
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          provider_reference: string;
          amount_minor: number;
          currency_code: string;
          status: "pending" | "paid" | "failed" | "refunded";
          raw_event_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      newsletter_subscribers: {
        Row: { email: string; created_at: string };
        Insert: { email: string };
        Update: never;
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contact_messages"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: never;
      };
      store_settings: {
        Row: { key: string; value: Json; updated_at: string };
        Insert: { key: string; value: Json };
        Update: { value?: Json };
      };
      faq_items: {
        Row: {
          id: string;
          question: string;
          answer: string;
          requires_owner_review: boolean;
          position: number;
        };
        Insert: Database["public"]["Tables"]["faq_items"]["Row"] & { id?: string };
        Update: Partial<Database["public"]["Tables"]["faq_items"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      checkout_create_order: {
        Args: {
          p_user_id: string | null;
          p_email: string;
          p_full_name: string;
          p_phone: string;
          p_region: string;
          p_locality: string;
          p_address_line: string;
          p_delivery_method: string;
          p_shipping_minor: number;
          p_notes: string | null;
          p_items: Json;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
};
