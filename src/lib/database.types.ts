export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          course_id: string | null
          created_at: string
          id: number
          meta: Json
          path: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: never
          meta?: Json
          path?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: never
          meta?: Json
          path?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: number
          meta: Json
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: never
          meta?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: never
          meta?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          feature: string
          id: number
          lesson_id: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          feature: string
          id?: never
          lesson_id?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          feature?: string
          id?: never
          lesson_id?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_messages_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          author_id: string | null
          body: string
          course_id: string | null
          cover_image_url: string | null
          cover_video_url: string | null
          created_at: string
          emailed_at: string | null
          id: string
          pinned: boolean
          scheduled_at: string | null
          status: Database["public"]["Enums"]["announcement_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string
          course_id?: string | null
          cover_image_url?: string | null
          cover_video_url?: string | null
          created_at?: string
          emailed_at?: string | null
          id?: string
          pinned?: boolean
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          course_id?: string | null
          cover_image_url?: string | null
          cover_video_url?: string | null
          created_at?: string
          emailed_at?: string | null
          id?: string
          pinned?: boolean
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_details: {
        Row: {
          address: string | null
          city: string | null
          company: string | null
          country: string | null
          name: string | null
          receipt_email: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          name?: string | null
          receipt_email?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          name?: string | null
          receipt_email?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_details_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_comments: {
        Row: {
          admin_reply: string | null
          approved: boolean
          author_email: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          post_id: string
          replied_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          approved?: boolean
          author_email?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          replied_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          approved?: boolean
          author_email?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          replied_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_curated: {
        Row: {
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          source_name: string
          title: string
          url: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          source_name: string
          title: string
          url: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          source_name?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      blog_likes: {
        Row: {
          created_at: string
          fingerprint: string
          post_id: string
        }
        Insert: {
          created_at?: string
          fingerprint: string
          post_id: string
        }
        Update: {
          created_at?: string
          fingerprint?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_categories: {
        Row: {
          category_id: string
          post_id: string
        }
        Insert: {
          category_id: string
          post_id: string
        }
        Update: {
          category_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_views: {
        Row: {
          country: string | null
          created_at: string
          id: number
          post_id: string
          read_seconds: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: never
          post_id: string
          read_seconds?: number | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: never
          post_id?: string
          read_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          featured: boolean
          focus_keyword: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          focus_keyword?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          focus_keyword?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          code: string
          course_id: string | null
          course_title: string
          instructor_name: string | null
          issued_at: string
          recipient_name: string
          revoked_at: string | null
          revoked_reason: string | null
          user_id: string
        }
        Insert: {
          code: string
          course_id?: string | null
          course_title: string
          instructor_name?: string | null
          issued_at?: string
          recipient_name: string
          revoked_at?: string | null
          revoked_reason?: string | null
          user_id: string
        }
        Update: {
          code?: string
          course_id?: string | null
          course_title?: string
          instructor_name?: string | null
          issued_at?: string
          recipient_name?: string
          revoked_at?: string | null
          revoked_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          discount_minor: number
          email: string
          id: string
          order_id: string
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          created_at?: string
          discount_minor: number
          email: string
          id?: string
          order_id: string
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          created_at?: string
          discount_minor?: number
          email?: string
          id?: string
          order_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          applies_to: string
          code: string
          course_ids: string[]
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          emails: string[]
          ends_at: string | null
          id: string
          kind: string
          max_uses: number | null
          min_order_minor: number
          per_person: number | null
          product_ids: string[]
          starts_at: string | null
          updated_at: string
          value: number
        }
        Insert: {
          active?: boolean
          applies_to?: string
          code: string
          course_ids?: string[]
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          emails?: string[]
          ends_at?: string | null
          id?: string
          kind: string
          max_uses?: number | null
          min_order_minor?: number
          per_person?: number | null
          product_ids?: string[]
          starts_at?: string | null
          updated_at?: string
          value: number
        }
        Update: {
          active?: boolean
          applies_to?: string
          code?: string
          course_ids?: string[]
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          emails?: string[]
          ends_at?: string | null
          id?: string
          kind?: string
          max_uses?: number | null
          min_order_minor?: number
          per_person?: number | null
          product_ids?: string[]
          starts_at?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          position: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          position?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_quizzes: {
        Row: {
          course_id: string
          created_at: string
          id: string
          module_id: string
          pass_mark: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          module_id: string
          pass_mark?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          module_id?: string
          pass_mark?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_quizzes_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          admin_reply: string | null
          approved: boolean
          body: string | null
          course_id: string
          created_at: string
          id: string
          rating: number
          replied_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          approved?: boolean
          body?: string | null
          course_id: string
          created_at?: string
          id?: string
          rating: number
          replied_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          approved?: boolean
          body?: string | null
          course_id?: string
          created_at?: string
          id?: string
          rating?: number
          replied_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          access_days: number | null
          category: string | null
          category_id: string | null
          cover_url: string | null
          created_at: string
          currency: string
          description: string | null
          featured: boolean
          id: string
          instructor_id: string
          level: Database["public"]["Enums"]["course_level"]
          price_minor: number
          published_at: string | null
          skills: string[]
          slug: string
          status: Database["public"]["Enums"]["course_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          access_days?: number | null
          category?: string | null
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          featured?: boolean
          id?: string
          instructor_id: string
          level?: Database["public"]["Enums"]["course_level"]
          price_minor?: number
          published_at?: string | null
          skills?: string[]
          slug: string
          status?: Database["public"]["Enums"]["course_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          access_days?: number | null
          category?: string | null
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          featured?: boolean
          id?: string
          instructor_id?: string
          level?: Database["public"]["Enums"]["course_level"]
          price_minor?: number
          published_at?: string | null
          skills?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["course_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          download_count: number
          file_key: string | null
          file_name: string | null
          file_size: number | null
          file_url: string
          id: string
          lesson_id: string | null
          mime_type: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
          visibility: Database["public"]["Enums"]["document_visibility"]
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number
          file_key?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          lesson_id?: string | null
          mime_type?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: Database["public"]["Enums"]["document_visibility"]
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number
          file_key?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          lesson_id?: string | null
          mime_type?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: Database["public"]["Enums"]["document_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "documents_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          kind: string
          provider_id: string | null
          ref: string | null
          status: string
          subject: string
          to_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          kind: string
          provider_id?: string | null
          ref?: string | null
          status: string
          subject: string
          to_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          kind?: string
          provider_id?: string | null
          ref?: string | null
          status?: string
          subject?: string
          to_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          design: Json
          html: string
          key: string
          subject: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          design: Json
          html: string
          key: string
          subject: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          design?: Json
          html?: string
          key?: string
          subject?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          expires_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          expires_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          expires_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          key: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          key: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          key?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_notes: {
        Row: {
          body: string
          bookmarked: boolean
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          bookmarked?: boolean
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          bookmarked?: boolean
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_watch: {
        Row: {
          lesson_id: string
          qualified: boolean
          updated_at: string
          user_id: string
          watched_seconds: number
        }
        Insert: {
          lesson_id: string
          qualified?: boolean
          updated_at?: string
          user_id: string
          watched_seconds?: number
        }
        Update: {
          lesson_id?: string
          qualified?: boolean
          updated_at?: string
          user_id?: string
          watched_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_watch_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          duration_seconds: number | null
          id: string
          is_preview: boolean
          kind: string
          module_id: string
          position: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_preview?: boolean
          kind?: string
          module_id: string
          position?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_preview?: boolean
          kind?: string
          module_id?: string
          position?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          href: string | null
          id: string
          kind: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          href?: string | null
          id?: string
          kind: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          href?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          country: string | null
          coupon_id: string | null
          created_at: string
          currency: string
          discount_minor: number
          email: string
          first_name: string
          id: string
          last_name: string
          last_reminded_at: string | null
          note: string | null
          paid_at: string | null
          phone: string | null
          reference: string
          reminders_sent: number
          state: string | null
          status: Database["public"]["Enums"]["payment_status"]
          total_minor: number
          user_id: string | null
        }
        Insert: {
          country?: string | null
          coupon_id?: string | null
          created_at?: string
          currency?: string
          discount_minor?: number
          email: string
          first_name: string
          id?: string
          last_name: string
          last_reminded_at?: string | null
          note?: string | null
          paid_at?: string | null
          phone?: string | null
          reference: string
          reminders_sent?: number
          state?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          total_minor: number
          user_id?: string | null
        }
        Update: {
          country?: string | null
          coupon_id?: string | null
          created_at?: string
          currency?: string
          discount_minor?: number
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          last_reminded_at?: string | null
          note?: string | null
          paid_at?: string | null
          phone?: string | null
          reference?: string
          reminders_sent?: number
          state?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          total_minor?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          authorization_code: string
          bank: string | null
          brand: string | null
          created_at: string
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean
          last4: string | null
          provider: string
          user_id: string
        }
        Insert: {
          authorization_code: string
          bank?: string | null
          brand?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          last4?: string | null
          provider?: string
          user_id: string
        }
        Update: {
          authorization_code?: string
          bank?: string | null
          brand?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          last4?: string | null
          provider?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_minor: number
          course_id: string | null
          created_at: string
          currency: string
          discount_minor: number
          id: string
          instructor_id: string | null
          note: string | null
          order_id: string | null
          paid_at: string | null
          provider: string
          reference: string
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string | null
        }
        Insert: {
          amount_minor: number
          course_id?: string | null
          created_at?: string
          currency?: string
          discount_minor?: number
          id?: string
          instructor_id?: string | null
          note?: string | null
          order_id?: string | null
          paid_at?: string | null
          provider?: string
          reference: string
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string | null
        }
        Update: {
          amount_minor?: number
          course_id?: string | null
          created_at?: string
          currency?: string
          discount_minor?: number
          id?: string
          instructor_id?: string | null
          note?: string | null
          order_id?: string | null
          paid_at?: string | null
          provider?: string
          reference?: string
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          accent_color: string
          accent_fg: string
          announcement_active: boolean
          announcement_link: string | null
          announcement_text: string | null
          certificate_signer_name: string | null
          certificate_signer_title: string | null
          email_from_name: string | null
          font: string
          hero_bg_url: string | null
          icon_url: string | null
          id: boolean
          logo_dark_url: string | null
          logo_url: string | null
          site_name: string
          social_instagram: string | null
          social_linkedin: string | null
          social_tiktok: string | null
          social_x: string | null
          social_youtube: string | null
          support_email: string | null
          support_whatsapp: string | null
          tagline: string | null
          theme_default: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          accent_color?: string
          accent_fg?: string
          announcement_active?: boolean
          announcement_link?: string | null
          announcement_text?: string | null
          certificate_signer_name?: string | null
          certificate_signer_title?: string | null
          email_from_name?: string | null
          font?: string
          hero_bg_url?: string | null
          icon_url?: string | null
          id?: boolean
          logo_dark_url?: string | null
          logo_url?: string | null
          site_name?: string
          social_instagram?: string | null
          social_linkedin?: string | null
          social_tiktok?: string | null
          social_x?: string | null
          social_youtube?: string | null
          support_email?: string | null
          support_whatsapp?: string | null
          tagline?: string | null
          theme_default?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          accent_color?: string
          accent_fg?: string
          announcement_active?: boolean
          announcement_link?: string | null
          announcement_text?: string | null
          certificate_signer_name?: string | null
          certificate_signer_title?: string | null
          email_from_name?: string | null
          font?: string
          hero_bg_url?: string | null
          icon_url?: string | null
          id?: boolean
          logo_dark_url?: string | null
          logo_url?: string | null
          site_name?: string
          social_instagram?: string | null
          social_linkedin?: string | null
          social_tiktok?: string | null
          social_x?: string | null
          social_youtube?: string | null
          support_email?: string | null
          support_whatsapp?: string | null
          tagline?: string | null
          theme_default?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          full_name: string | null
          guide_state: Json
          headline: string | null
          id: string
          interests: string[]
          last_seen_at: string | null
          learning_goal: string | null
          linkedin_url: string | null
          location: string | null
          notification_prefs: Json
          onboarded_at: string | null
          profile_public: boolean
          show_current_learning: boolean
          skill_level: string | null
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          username: string | null
          website_url: string | null
          weekly_goal: number | null
          weekly_hours: string | null
          x_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          full_name?: string | null
          guide_state?: Json
          headline?: string | null
          id: string
          interests?: string[]
          last_seen_at?: string | null
          learning_goal?: string | null
          linkedin_url?: string | null
          location?: string | null
          notification_prefs?: Json
          onboarded_at?: string | null
          profile_public?: boolean
          show_current_learning?: boolean
          skill_level?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          username?: string | null
          website_url?: string | null
          weekly_goal?: number | null
          weekly_hours?: string | null
          x_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          full_name?: string | null
          guide_state?: Json
          headline?: string | null
          id?: string
          interests?: string[]
          last_seen_at?: string | null
          learning_goal?: string | null
          linkedin_url?: string | null
          location?: string | null
          notification_prefs?: Json
          onboarded_at?: string | null
          profile_public?: boolean
          show_current_learning?: boolean
          skill_level?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          username?: string | null
          website_url?: string | null
          weekly_goal?: number | null
          weekly_hours?: string | null
          x_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json
          created_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          passed: boolean
          quiz_id: string
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "course_quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_index: number
          explanation: string | null
          id: string
          options: string[]
          position: number
          prompt: string
          quiz_id: string
        }
        Insert: {
          correct_index: number
          explanation?: string | null
          id?: string
          options: string[]
          position?: number
          prompt: string
          quiz_id: string
        }
        Update: {
          correct_index?: number
          explanation?: string | null
          id?: string
          options?: string[]
          position?: number
          prompt?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "course_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_courses: {
        Row: {
          course_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_staff: boolean
          sender_id: string | null
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_staff?: boolean
          sender_id?: string | null
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_staff?: boolean
          sender_id?: string | null
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "support_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      support_threads: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          last_message_at: string
          staff_unread: boolean
          status: Database["public"]["Enums"]["thread_status"]
          subject: string
          user_id: string
          user_unread: boolean
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          staff_unread?: boolean
          status?: Database["public"]["Enums"]["thread_status"]
          subject: string
          user_id: string
          user_unread?: boolean
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          staff_unread?: boolean
          status?: Database["public"]["Enums"]["thread_status"]
          subject?: string
          user_id?: string
          user_unread?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "support_threads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          seen_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          seen_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          seen_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          browser: string | null
          channel: string
          city: string | null
          country: string | null
          created_at: string
          device: string | null
          id: string
          landing_path: string
          last_path: string | null
          last_seen_at: string
          os: string | null
          pages: number
          referrer: string | null
          referrer_host: string | null
          region: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          channel?: string
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          landing_path: string
          last_path?: string | null
          last_seen_at?: string
          os?: string | null
          pages?: number
          referrer?: string | null
          referrer_host?: string | null
          region?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          channel?: string
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: string
          landing_path?: string
          last_path?: string | null
          last_seen_at?: string
          os?: string | null
          pages?: number
          referrer?: string | null
          referrer_host?: string | null
          region?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_active_users: {
        Args: { p_days?: number; p_end?: string }
        Returns: number
      }
      admin_daily_activity: {
        Args: { p_days?: number; p_end?: string }
        Returns: {
          day: string
          signups: number
          enrollments: number
          completions: number
          page_views: number
          active_users: number
        }[]
      }
      admin_list_users: {
        Args: { p_search?: string; p_role?: Database["public"]["Enums"]["app_role"]; p_deleted?: boolean; p_limit?: number; p_offset?: number }
        Returns: {
          id: string
          email: string
          full_name: string
          avatar_url: string
          roles: Database["public"]["Enums"]["app_role"][]
          status: Database["public"]["Enums"]["account_status"]
          created_at: string
          last_sign_in_at: string
          email_confirmed: boolean
          deleted_at: string
          enrollment_count: number
          course_count: number
          total_count: number
        }[]
      }
      admin_monthly_revenue: {
        Args: { p_months?: number }
        Returns: {
          month: string
          gross_minor: number
          discount_minor: number
          sales: number
        }[]
      }
      admin_top_courses: {
        Args: { p_days?: number; p_limit?: number; p_end?: string }
        Returns: {
          course_id: string
          title: string
          enrollments: number
          completions: number
          learners: number
        }[]
      }
      admin_top_pages: {
        Args: { p_days?: number; p_limit?: number; p_end?: string }
        Returns: {
          path: string
          views: number
          visitors: number
        }[]
      }
      admin_traffic_report: {
        Args: { p_days?: number; p_end?: string }
        Returns: Json
      }
      blog_post_metrics: {
        Args: never
        Returns: {
          post_id: string
          views: number
          likes: number
          comments: number
          pending: number
          avg_read: number
        }[]
      }
      course_is_published: {
        Args: { p_course_id: string }
        Returns: boolean
      }
      course_lesson_counts: {
        Args: { p_course_ids: string[] }
        Returns: {
          course_id: string
          lesson_count: number
        }[]
      }
      course_metrics: {
        Args: never
        Returns: {
          course_id: string
          students: number
          completed: number
          revenue_minor: number
          rating: number
          reviews: number
          pending_reviews: number
        }[]
      }
      course_ratings: {
        Args: { p_course_ids: string[] }
        Returns: {
          course_id: string
          rating: number
          reviews: number
        }[]
      }
      has_role: {
        Args: { p_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_admin: {
        Args: never
        Returns: boolean
      }
      is_enrolled: {
        Args: { p_course_id: string }
        Returns: boolean
      }
      is_instructor: {
        Args: never
        Returns: boolean
      }
      mark_thread_read: {
        Args: { p_thread_id: string }
        Returns: undefined
      }
      my_profile: {
        Args: never
        Returns: {
          status: Database["public"]["Enums"]["account_status"]
          deleted_at: string
          last_seen_at: string
          notification_prefs: Json
          learning_goal: string
          skill_level: string
          weekly_hours: string
          weekly_goal: number
          onboarded_at: string
          show_current_learning: boolean
          updated_at: string
        }[]
      }
      notify: {
        Args: { p_user: string; p_kind: string; p_title: string; p_body: string; p_href: string }
        Returns: undefined
      }
      owns_course: {
        Args: { p_course_id: string }
        Returns: boolean
      }
      quiz_progress: {
        Args: { p_user_id: string; p_course_ids: string[] }
        Returns: {
          course_id: string
          quizzes: number
          passed: number
        }[]
      }
      renew_enrollments: {
        Args: { p_user_id: string; p_course_ids: string[] }
        Returns: undefined
      }
      track_visit: {
        Args: { p_visit_id: string; p_visitor_id: string; p_user_id: string; p_path: string; p_new_campaign: boolean; p_referrer: string; p_referrer_host: string; p_utm_source: string; p_utm_medium: string; p_utm_campaign: string; p_utm_term: string; p_utm_content: string; p_channel: string; p_country: string; p_region: string; p_city: string; p_device: string; p_browser: string; p_os: string }
        Returns: string
      }
      user_id_by_email: {
        Args: { p_email: string }
        Returns: string
      }
    }
    Enums: {
      account_status: "active" | "suspended"
      announcement_status: "draft" | "scheduled" | "published" | "archived"
      app_role: "super_admin" | "editor" | "accountant" | "tutor" | "student"
      course_level: "beginner" | "intermediate" | "advanced"
      course_status: "draft" | "pending" | "published" | "rejected" | "archived"
      document_visibility: "public" | "enrolled" | "private"
      payment_status: "pending" | "success" | "failed" | "refunded"
      post_status: "draft" | "published" | "scheduled"
      thread_status: "open" | "pending" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "suspended"],
      announcement_status: ["draft", "scheduled", "published", "archived"],
      app_role: ["super_admin", "editor", "accountant", "tutor", "student"],
      course_level: ["beginner", "intermediate", "advanced"],
      course_status: ["draft", "pending", "published", "rejected", "archived"],
      document_visibility: ["public", "enrolled", "private"],
      payment_status: ["pending", "success", "failed", "refunded"],
      post_status: ["draft", "published", "scheduled"],
      thread_status: ["open", "pending", "closed"],
    },
  },
} as const
