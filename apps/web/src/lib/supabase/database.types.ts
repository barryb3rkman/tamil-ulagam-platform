export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      application_review_history: {
        Row: {
          actor_user_id: string | null;
          application_id: string;
          created_at: string;
          feedback: string | null;
          id: string;
          new_status: Database["public"]["Enums"]["registration_status"];
          previous_status:
            Database["public"]["Enums"]["registration_status"] | null;
        };
        Insert: {
          actor_user_id?: string | null;
          application_id: string;
          created_at?: string;
          feedback?: string | null;
          id?: string;
          new_status: Database["public"]["Enums"]["registration_status"];
          previous_status?:
            Database["public"]["Enums"]["registration_status"] | null;
        };
        Update: {
          actor_user_id?: string | null;
          application_id?: string;
          created_at?: string;
          feedback?: string | null;
          id?: string;
          new_status?: Database["public"]["Enums"]["registration_status"];
          previous_status?:
            Database["public"]["Enums"]["registration_status"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "application_review_history_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "organization_applications";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_applications: {
        Row: {
          accuracy_declaration: boolean;
          admin_feedback: string | null;
          authorization_declaration: boolean;
          created_at: string;
          current_step: number;
          id: string;
          organization_id: string;
          representative_designation: string;
          representative_email: string;
          representative_full_name: string;
          representative_phone: string;
          representative_relationship:
            Database["public"]["Enums"]["representative_relationship"] | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["registration_status"];
          submitted_at: string | null;
          submitted_by: string;
          updated_at: string;
        };
        Insert: {
          accuracy_declaration?: boolean;
          admin_feedback?: string | null;
          authorization_declaration?: boolean;
          created_at?: string;
          current_step?: number;
          id?: string;
          organization_id: string;
          representative_designation?: string;
          representative_email?: string;
          representative_full_name?: string;
          representative_phone?: string;
          representative_relationship?:
            Database["public"]["Enums"]["representative_relationship"] | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["registration_status"];
          submitted_at?: string | null;
          submitted_by: string;
          updated_at?: string;
        };
        Update: {
          accuracy_declaration?: boolean;
          admin_feedback?: string | null;
          authorization_declaration?: boolean;
          created_at?: string;
          current_step?: number;
          id?: string;
          organization_id?: string;
          representative_designation?: string;
          representative_email?: string;
          representative_full_name?: string;
          representative_phone?: string;
          representative_relationship?:
            Database["public"]["Enums"]["representative_relationship"] | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["registration_status"];
          submitted_at?: string | null;
          submitted_by?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_applications_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_business_details: {
        Row: {
          business_type: string;
          created_at: string;
          employee_size: string;
          industry: string;
          operating_countries: string;
          organization_id: string;
          products_services: string;
          updated_at: string;
        };
        Insert: {
          business_type?: string;
          created_at?: string;
          employee_size?: string;
          industry?: string;
          operating_countries?: string;
          organization_id: string;
          products_services?: string;
          updated_at?: string;
        };
        Update: {
          business_type?: string;
          created_at?: string;
          employee_size?: string;
          industry?: string;
          operating_countries?: string;
          organization_id?: string;
          products_services?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_business_details_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_education_details: {
        Row: {
          accreditation_authority: string;
          accreditation_number: string;
          created_at: string;
          governance_type: string;
          institution_type: string;
          organization_id: string;
          student_population: string;
          study_areas: string[];
          tamil_programmes_description: string;
          tamil_programmes_offered: boolean | null;
          updated_at: string;
        };
        Insert: {
          accreditation_authority?: string;
          accreditation_number?: string;
          created_at?: string;
          governance_type?: string;
          institution_type?: string;
          organization_id: string;
          student_population?: string;
          study_areas?: string[];
          tamil_programmes_description?: string;
          tamil_programmes_offered?: boolean | null;
          updated_at?: string;
        };
        Update: {
          accreditation_authority?: string;
          accreditation_number?: string;
          created_at?: string;
          governance_type?: string;
          institution_type?: string;
          organization_id?: string;
          student_population?: string;
          study_areas?: string[];
          tamil_programmes_description?: string;
          tamil_programmes_offered?: boolean | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_education_details_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_email_verifications: {
        Row: {
          consumed_at: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          organization_id: string;
          token_hash: string;
        };
        Insert: {
          consumed_at?: string | null;
          created_at?: string;
          expires_at: string;
          id?: string;
          organization_id: string;
          token_hash: string;
        };
        Update: {
          consumed_at?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          organization_id?: string;
          token_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_email_verifications_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_healthcare_details: {
        Row: {
          created_at: string;
          emergency_services: boolean;
          facility_type: string;
          licence_number: string;
          licensed: boolean | null;
          licensing_authority: string;
          main_services: string;
          number_of_beds: number | null;
          organization_id: string;
          ownership_type: string;
          systems_of_medicine: string[];
          twenty_four_seven: boolean;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          emergency_services?: boolean;
          facility_type?: string;
          licence_number?: string;
          licensed?: boolean | null;
          licensing_authority?: string;
          main_services?: string;
          number_of_beds?: number | null;
          organization_id: string;
          ownership_type?: string;
          systems_of_medicine?: string[];
          twenty_four_seven?: boolean;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          emergency_services?: boolean;
          facility_type?: string;
          licence_number?: string;
          licensed?: boolean | null;
          licensing_authority?: string;
          main_services?: string;
          number_of_beds?: number | null;
          organization_id?: string;
          ownership_type?: string;
          systems_of_medicine?: string[];
          twenty_four_seven?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_healthcare_details_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_manager_history: {
        Row: {
          actor_user_id: string | null;
          created_at: string;
          event_type: Database["public"]["Enums"]["organization_manager_history_event"];
          id: string;
          invitation_id: string | null;
          manager_user_id: string | null;
          new_role:
            Database["public"]["Enums"]["organization_membership_role"] | null;
          note: string | null;
          organization_id: string;
          previous_role:
            Database["public"]["Enums"]["organization_membership_role"] | null;
        };
        Insert: {
          actor_user_id?: string | null;
          created_at?: string;
          event_type: Database["public"]["Enums"]["organization_manager_history_event"];
          id?: string;
          invitation_id?: string | null;
          manager_user_id?: string | null;
          new_role?:
            Database["public"]["Enums"]["organization_membership_role"] | null;
          note?: string | null;
          organization_id: string;
          previous_role?:
            Database["public"]["Enums"]["organization_membership_role"] | null;
        };
        Update: {
          actor_user_id?: string | null;
          created_at?: string;
          event_type?: Database["public"]["Enums"]["organization_manager_history_event"];
          id?: string;
          invitation_id?: string | null;
          manager_user_id?: string | null;
          new_role?:
            Database["public"]["Enums"]["organization_membership_role"] | null;
          note?: string | null;
          organization_id?: string;
          previous_role?:
            Database["public"]["Enums"]["organization_membership_role"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "organization_manager_history_invitation_id_fkey";
            columns: ["invitation_id"];
            isOneToOne: false;
            referencedRelation: "organization_manager_invitations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_manager_history_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_manager_invitations: {
        Row: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          declined_at: string | null;
          email: string;
          expires_at: string;
          id: string;
          invited_at: string;
          invited_by: string | null;
          organization_id: string;
          revoked_at: string | null;
          role: Database["public"]["Enums"]["organization_membership_role"];
          status: Database["public"]["Enums"]["organization_manager_invitation_status"];
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          declined_at?: string | null;
          email: string;
          expires_at?: string;
          id?: string;
          invited_at?: string;
          invited_by?: string | null;
          organization_id: string;
          revoked_at?: string | null;
          role: Database["public"]["Enums"]["organization_membership_role"];
          status?: Database["public"]["Enums"]["organization_manager_invitation_status"];
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          declined_at?: string | null;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_at?: string;
          invited_by?: string | null;
          organization_id?: string;
          revoked_at?: string | null;
          role?: Database["public"]["Enums"]["organization_membership_role"];
          status?: Database["public"]["Enums"]["organization_manager_invitation_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_manager_invitations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_managers: {
        Row: {
          granted_at: string;
          granted_by: string | null;
          id: string;
          organization_id: string;
          role: Database["public"]["Enums"]["organization_membership_role"];
          user_id: string;
        };
        Insert: {
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          organization_id: string;
          role: Database["public"]["Enums"]["organization_membership_role"];
          user_id: string;
        };
        Update: {
          granted_at?: string;
          granted_by?: string | null;
          id?: string;
          organization_id?: string;
          role?: Database["public"]["Enums"]["organization_membership_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_managers_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_members: {
        Row: {
          created_at: string;
          id: string;
          is_primary: boolean;
          organization_id: string;
          role: Database["public"]["Enums"]["organization_membership_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          organization_id: string;
          role: Database["public"]["Enums"]["organization_membership_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          organization_id?: string;
          role?: Database["public"]["Enums"]["organization_membership_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_membership_history: {
        Row: {
          actor_user_id: string | null;
          created_at: string;
          id: string;
          membership_id: string;
          new_status: Database["public"]["Enums"]["organization_membership_status"];
          note: string | null;
          previous_status:
            | Database["public"]["Enums"]["organization_membership_status"]
            | null;
        };
        Insert: {
          actor_user_id?: string | null;
          created_at?: string;
          id?: string;
          membership_id: string;
          new_status: Database["public"]["Enums"]["organization_membership_status"];
          note?: string | null;
          previous_status?:
            | Database["public"]["Enums"]["organization_membership_status"]
            | null;
        };
        Update: {
          actor_user_id?: string | null;
          created_at?: string;
          id?: string;
          membership_id?: string;
          new_status?: Database["public"]["Enums"]["organization_membership_status"];
          note?: string | null;
          previous_status?:
            | Database["public"]["Enums"]["organization_membership_status"]
            | null;
        };
        Relationships: [
          {
            foreignKeyName: "organization_membership_history_membership_id_fkey";
            columns: ["membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_memberships: {
        Row: {
          created_at: string;
          decided_at: string | null;
          decided_by: string | null;
          expires_at: string | null;
          id: string;
          invited_at: string | null;
          invited_by: string | null;
          membership_type:
            Database["public"]["Enums"]["organization_membership_type"] | null;
          organization_id: string;
          requested_at: string | null;
          status: Database["public"]["Enums"]["organization_membership_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          decided_at?: string | null;
          decided_by?: string | null;
          expires_at?: string | null;
          id?: string;
          invited_at?: string | null;
          invited_by?: string | null;
          membership_type?:
            Database["public"]["Enums"]["organization_membership_type"] | null;
          organization_id: string;
          requested_at?: string | null;
          status?: Database["public"]["Enums"]["organization_membership_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          decided_at?: string | null;
          decided_by?: string | null;
          expires_at?: string | null;
          id?: string;
          invited_at?: string | null;
          invited_by?: string | null;
          membership_type?:
            Database["public"]["Enums"]["organization_membership_type"] | null;
          organization_id?: string;
          requested_at?: string | null;
          status?: Database["public"]["Enums"]["organization_membership_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_nonprofit_details: {
        Row: {
          beneficiary_regions: string;
          created_at: string;
          organization_id: string;
          organization_size: string;
          primary_areas: string[];
          subtype: string;
          updated_at: string;
        };
        Insert: {
          beneficiary_regions?: string;
          created_at?: string;
          organization_id: string;
          organization_size?: string;
          primary_areas?: string[];
          subtype?: string;
          updated_at?: string;
        };
        Update: {
          beneficiary_regions?: string;
          created_at?: string;
          organization_id?: string;
          organization_size?: string;
          primary_areas?: string[];
          subtype?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_nonprofit_details_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_other_details: {
        Row: {
          created_at: string;
          organization_id: string;
          organization_type: string;
          primary_purpose: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          organization_id: string;
          organization_type?: string;
          primary_purpose?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          organization_id?: string;
          organization_type?: string;
          primary_purpose?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_other_details_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_tamil_community_details: {
        Row: {
          chairperson_name: string;
          created_at: string;
          geographic_area_served: string;
          languages: string;
          membership_size: string;
          network_affiliated: boolean | null;
          network_name: string;
          organization_id: string;
          primary_activities: string[];
          secretary_name: string;
          subtype: string;
          updated_at: string;
        };
        Insert: {
          chairperson_name?: string;
          created_at?: string;
          geographic_area_served?: string;
          languages?: string;
          membership_size?: string;
          network_affiliated?: boolean | null;
          network_name?: string;
          organization_id: string;
          primary_activities?: string[];
          secretary_name?: string;
          subtype?: string;
          updated_at?: string;
        };
        Update: {
          chairperson_name?: string;
          created_at?: string;
          geographic_area_served?: string;
          languages?: string;
          membership_size?: string;
          network_affiliated?: boolean | null;
          network_name?: string;
          organization_id?: string;
          primary_activities?: string[];
          secretary_name?: string;
          subtype?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_tamil_community_details_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          category: Database["public"]["Enums"]["organization_category"] | null;
          city: string;
          country: string;
          created_at: string;
          description: string;
          id: string;
          logo_path: string | null;
          name: string;
          official_email: string;
          official_email_verification_sent_at: string | null;
          official_email_verified_at: string | null;
          official_phone: string;
          postal_code: string;
          region: string;
          registration_authority: string;
          registration_country: string;
          registration_number: string;
          registration_status:
            Database["public"]["Enums"]["legal_registration_status"] | null;
          street_address: string;
          updated_at: string;
          website: string;
          year_established: number | null;
        };
        Insert: {
          category?:
            Database["public"]["Enums"]["organization_category"] | null;
          city?: string;
          country?: string;
          created_at?: string;
          description?: string;
          id?: string;
          logo_path?: string | null;
          name?: string;
          official_email?: string;
          official_email_verification_sent_at?: string | null;
          official_email_verified_at?: string | null;
          official_phone?: string;
          postal_code?: string;
          region?: string;
          registration_authority?: string;
          registration_country?: string;
          registration_number?: string;
          registration_status?:
            Database["public"]["Enums"]["legal_registration_status"] | null;
          street_address?: string;
          updated_at?: string;
          website?: string;
          year_established?: number | null;
        };
        Update: {
          category?:
            Database["public"]["Enums"]["organization_category"] | null;
          city?: string;
          country?: string;
          created_at?: string;
          description?: string;
          id?: string;
          logo_path?: string | null;
          name?: string;
          official_email?: string;
          official_email_verification_sent_at?: string | null;
          official_email_verified_at?: string | null;
          official_phone?: string;
          postal_code?: string;
          region?: string;
          registration_authority?: string;
          registration_country?: string;
          registration_number?: string;
          registration_status?:
            Database["public"]["Enums"]["legal_registration_status"] | null;
          street_address?: string;
          updated_at?: string;
          website?: string;
          year_established?: number | null;
        };
        Relationships: [];
      };
      partnership_enquiries: {
        Row: {
          country: string;
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          organization_name: string;
          partnership_area: Database["public"]["Enums"]["partnership_area"];
          status: Database["public"]["Enums"]["partnership_status"];
          updated_at: string;
        };
        Insert: {
          country: string;
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          organization_name?: string;
          partnership_area: Database["public"]["Enums"]["partnership_area"];
          status?: Database["public"]["Enums"]["partnership_status"];
          updated_at?: string;
        };
        Update: {
          country?: string;
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          organization_name?: string;
          partnership_area?: Database["public"]["Enums"]["partnership_area"];
          status?: Database["public"]["Enums"]["partnership_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      partnership_enquiry_history: {
        Row: {
          actor_user_id: string | null;
          created_at: string;
          enquiry_id: string;
          id: string;
          new_status: Database["public"]["Enums"]["partnership_status"];
          note: string | null;
          previous_status:
            Database["public"]["Enums"]["partnership_status"] | null;
        };
        Insert: {
          actor_user_id?: string | null;
          created_at?: string;
          enquiry_id: string;
          id?: string;
          new_status: Database["public"]["Enums"]["partnership_status"];
          note?: string | null;
          previous_status?:
            Database["public"]["Enums"]["partnership_status"] | null;
        };
        Update: {
          actor_user_id?: string | null;
          created_at?: string;
          enquiry_id?: string;
          id?: string;
          new_status?: Database["public"]["Enums"]["partnership_status"];
          note?: string | null;
          previous_status?:
            Database["public"]["Enums"]["partnership_status"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "partnership_enquiry_history_enquiry_id_fkey";
            columns: ["enquiry_id"];
            isOneToOne: false;
            referencedRelation: "partnership_enquiries";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          country: string;
          created_at: string;
          full_name: string;
          id: string;
          phone: string;
          terms_accepted_at: string | null;
          updated_at: string;
        };
        Insert: {
          country?: string;
          created_at?: string;
          full_name?: string;
          id: string;
          phone?: string;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          country?: string;
          created_at?: string;
          full_name?: string;
          id?: string;
          phone?: string;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          granted_by: string | null;
          role: Database["public"]["Enums"]["application_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          granted_by?: string | null;
          role: Database["public"]["Enums"]["application_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          granted_by?: string | null;
          role?: Database["public"]["Enums"]["application_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_organization_manager_invitation: {
        Args: { target_invitation_id: string };
        Returns: {
          granted_at: string;
          granted_by: string | null;
          id: string;
          organization_id: string;
          role: Database["public"]["Enums"]["organization_membership_role"];
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_managers";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      can_manage_organization: {
        Args: { target_organization_id: string };
        Returns: boolean;
      };
      change_organization_manager_role: {
        Args: {
          new_role: Database["public"]["Enums"]["organization_membership_role"];
          target_organization_id: string;
          target_user_id: string;
        };
        Returns: {
          granted_at: string;
          granted_by: string | null;
          id: string;
          organization_id: string;
          role: Database["public"]["Enums"]["organization_membership_role"];
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_managers";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      check_duplicate_organization_signals: {
        Args: {
          candidate_name: string;
          candidate_official_email?: string;
          candidate_registration_number?: string;
          exclude_organization_id?: string;
        };
        Returns: Json;
      };
      create_organization_application_draft: {
        Args: {
          initial_category?: Database["public"]["Enums"]["organization_category"];
        };
        Returns: {
          accuracy_declaration: boolean;
          admin_feedback: string | null;
          authorization_declaration: boolean;
          created_at: string;
          current_step: number;
          id: string;
          organization_id: string;
          representative_designation: string;
          representative_email: string;
          representative_full_name: string;
          representative_phone: string;
          representative_relationship:
            Database["public"]["Enums"]["representative_relationship"] | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["registration_status"];
          submitted_at: string | null;
          submitted_by: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_applications";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      decide_organization_membership: {
        Args: {
          decision_note?: string;
          target_membership_id: string;
          target_status: Database["public"]["Enums"]["organization_membership_status"];
        };
        Returns: {
          created_at: string;
          decided_at: string | null;
          decided_by: string | null;
          expires_at: string | null;
          id: string;
          invited_at: string | null;
          invited_by: string | null;
          membership_type:
            Database["public"]["Enums"]["organization_membership_type"] | null;
          organization_id: string;
          requested_at: string | null;
          status: Database["public"]["Enums"]["organization_membership_status"];
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_memberships";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      decline_organization_manager_invitation: {
        Args: { target_invitation_id: string };
        Returns: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          declined_at: string | null;
          email: string;
          expires_at: string;
          id: string;
          invited_at: string;
          invited_by: string | null;
          organization_id: string;
          revoked_at: string | null;
          role: Database["public"]["Enums"]["organization_membership_role"];
          status: Database["public"]["Enums"]["organization_manager_invitation_status"];
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_manager_invitations";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      ensure_sangam_application_draft: {
        Args: never;
        Returns: {
          accuracy_declaration: boolean;
          admin_feedback: string | null;
          authorization_declaration: boolean;
          created_at: string;
          current_step: number;
          id: string;
          organization_id: string;
          representative_designation: string;
          representative_email: string;
          representative_full_name: string;
          representative_phone: string;
          representative_relationship:
            Database["public"]["Enums"]["representative_relationship"] | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["registration_status"];
          submitted_at: string | null;
          submitted_by: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_applications";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      get_admin_attention_summary: {
        Args: never;
        Returns: {
          new_partnership_enquiries: number;
          pending_memberships: number;
          registration_follow_ups: number;
          registration_reviews: number;
          verified_organizations: number;
          verified_sangams: number;
        }[];
      };
      get_federation_capabilities: {
        Args: never;
        Returns: {
          can_operate_federation: boolean;
          can_review_registrations: boolean;
        }[];
      };
      invite_organization_manager: {
        Args: {
          invitee_email: string;
          invitee_role: Database["public"]["Enums"]["organization_membership_role"];
          target_organization_id: string;
        };
        Returns: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          declined_at: string | null;
          email: string;
          expires_at: string;
          id: string;
          invited_at: string;
          invited_by: string | null;
          organization_id: string;
          revoked_at: string | null;
          role: Database["public"]["Enums"]["organization_membership_role"];
          status: Database["public"]["Enums"]["organization_manager_invitation_status"];
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_manager_invitations";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      invite_organization_member: {
        Args: {
          invited_membership_type?: Database["public"]["Enums"]["organization_membership_type"];
          target_organization_id: string;
          target_user_id: string;
        };
        Returns: {
          created_at: string;
          decided_at: string | null;
          decided_by: string | null;
          expires_at: string | null;
          id: string;
          invited_at: string | null;
          invited_by: string | null;
          membership_type:
            Database["public"]["Enums"]["organization_membership_type"] | null;
          organization_id: string;
          requested_at: string | null;
          status: Database["public"]["Enums"]["organization_membership_status"];
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_memberships";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      is_application_reviewer: { Args: never; Returns: boolean };
      is_organization_member: {
        Args: { target_organization_id: string };
        Returns: boolean;
      };
      is_organization_membership_eligible: {
        Args: { target_organization_id: string };
        Returns: boolean;
      };
      is_platform_admin: { Args: never; Returns: boolean };
      issue_organization_email_verification_token: {
        Args: { target_organization_id: string };
        Returns: string;
      };
      leave_organization_management: {
        Args: { target_organization_id: string };
        Returns: undefined;
      };
      leave_organization_membership: {
        Args: { decision_note?: string; target_membership_id: string };
        Returns: {
          created_at: string;
          decided_at: string | null;
          decided_by: string | null;
          expires_at: string | null;
          id: string;
          invited_at: string | null;
          invited_by: string | null;
          membership_type:
            Database["public"]["Enums"]["organization_membership_type"] | null;
          organization_id: string;
          requested_at: string | null;
          status: Database["public"]["Enums"]["organization_membership_status"];
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_memberships";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      list_admin_membership_operations: {
        Args: never;
        Returns: {
          created_at: string;
          decided_at: string;
          decided_by_name: string;
          id: string;
          invited_at: string;
          member_email: string;
          member_full_name: string;
          membership_type: string;
          organization_id: string;
          organization_kind: string;
          organization_name: string;
          requested_at: string;
          status: Database["public"]["Enums"]["organization_membership_status"];
          user_id: string;
        }[];
      };
      list_admin_organization_managers: {
        Args: { target_organization_id: string };
        Returns: {
          full_name: string;
          granted_at: string;
          id: string;
          organization_id: string;
          role: Database["public"]["Enums"]["organization_membership_role"];
          user_id: string;
        }[];
      };
      list_admin_organization_operations: {
        Args: never;
        Returns: {
          application_status: Database["public"]["Enums"]["registration_status"];
          category: Database["public"]["Enums"]["organization_category"];
          city: string;
          country: string;
          description: string;
          id: string;
          kind: string;
          manager_count: number;
          member_count: number;
          name: string;
          network_affiliated: boolean;
          network_name: string;
          official_email_verified_at: string;
          region: string;
          registration_status: Database["public"]["Enums"]["legal_registration_status"];
          subtype: string;
          updated_at: string;
        }[];
      };
      list_admin_partnership_enquiries: {
        Args: never;
        Returns: {
          country: string;
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          organization_name: string;
          partnership_area: Database["public"]["Enums"]["partnership_area"];
          status: Database["public"]["Enums"]["partnership_status"];
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "partnership_enquiries";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      list_admin_partnership_history: {
        Args: { target_enquiry_id: string };
        Returns: {
          actor_name: string;
          actor_user_id: string;
          created_at: string;
          enquiry_id: string;
          id: string;
          new_status: Database["public"]["Enums"]["partnership_status"];
          note: string;
          previous_status: Database["public"]["Enums"]["partnership_status"];
        }[];
      };
      list_admin_recent_activity: {
        Args: { activity_limit?: number };
        Returns: {
          description: string;
          domain: string;
          id: string;
          occurred_at: string;
          status: string;
          title: string;
        }[];
      };
      list_membership_eligible_organizations: {
        Args: never;
        Returns: {
          category: Database["public"]["Enums"]["organization_category"];
          city: string;
          country: string;
          id: string;
          name: string;
          region: string;
          subtype: string;
        }[];
      };
      list_my_affiliated_organizations: {
        Args: never;
        Returns: {
          category: Database["public"]["Enums"]["organization_category"];
          city: string;
          country: string;
          id: string;
          name: string;
          region: string;
          subtype: string;
        }[];
      };
      list_my_management_invitations: {
        Args: never;
        Returns: {
          expires_at: string;
          id: string;
          invited_at: string;
          invited_by: string;
          inviter_name: string;
          organization_id: string;
          organization_kind: string;
          organization_name: string;
          role: Database["public"]["Enums"]["organization_membership_role"];
          status: Database["public"]["Enums"]["organization_manager_invitation_status"];
        }[];
      };
      list_organization_management_history: {
        Args: { target_organization_id: string };
        Returns: {
          actor_name: string;
          actor_user_id: string;
          created_at: string;
          event_type: Database["public"]["Enums"]["organization_manager_history_event"];
          id: string;
          invitation_id: string;
          manager_name: string;
          manager_user_id: string;
          new_role: Database["public"]["Enums"]["organization_membership_role"];
          note: string;
          organization_id: string;
          previous_role: Database["public"]["Enums"]["organization_membership_role"];
        }[];
      };
      list_organization_manager_invitations: {
        Args: { target_organization_id: string };
        Returns: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          declined_at: string | null;
          email: string;
          expires_at: string;
          id: string;
          invited_at: string;
          invited_by: string | null;
          organization_id: string;
          revoked_at: string | null;
          role: Database["public"]["Enums"]["organization_membership_role"];
          status: Database["public"]["Enums"]["organization_manager_invitation_status"];
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "organization_manager_invitations";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      list_organization_managers: {
        Args: { target_organization_id: string };
        Returns: {
          full_name: string;
          granted_at: string;
          granted_by: string;
          id: string;
          organization_id: string;
          role: Database["public"]["Enums"]["organization_membership_role"];
          user_id: string;
        }[];
      };
      organization_application_is_editable: {
        Args: { target_organization_id: string };
        Returns: boolean;
      };
      remove_organization_manager: {
        Args: { target_organization_id: string; target_user_id: string };
        Returns: undefined;
      };
      request_organization_membership: {
        Args: {
          requested_membership_type?: Database["public"]["Enums"]["organization_membership_type"];
          target_organization_id: string;
        };
        Returns: {
          created_at: string;
          decided_at: string | null;
          decided_by: string | null;
          expires_at: string | null;
          id: string;
          invited_at: string | null;
          invited_by: string | null;
          membership_type:
            Database["public"]["Enums"]["organization_membership_type"] | null;
          organization_id: string;
          requested_at: string | null;
          status: Database["public"]["Enums"]["organization_membership_status"];
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_memberships";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      review_organization_application: {
        Args: {
          review_feedback?: string;
          target_application_id: string;
          target_status: Database["public"]["Enums"]["registration_status"];
        };
        Returns: {
          accuracy_declaration: boolean;
          admin_feedback: string | null;
          authorization_declaration: boolean;
          created_at: string;
          current_step: number;
          id: string;
          organization_id: string;
          representative_designation: string;
          representative_email: string;
          representative_full_name: string;
          representative_phone: string;
          representative_relationship:
            Database["public"]["Enums"]["representative_relationship"] | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["registration_status"];
          submitted_at: string | null;
          submitted_by: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_applications";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      revoke_organization_manager_invitation: {
        Args: { target_invitation_id: string };
        Returns: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          declined_at: string | null;
          email: string;
          expires_at: string;
          id: string;
          invited_at: string;
          invited_by: string | null;
          organization_id: string;
          revoked_at: string | null;
          role: Database["public"]["Enums"]["organization_membership_role"];
          status: Database["public"]["Enums"]["organization_manager_invitation_status"];
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_manager_invitations";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      revoke_organization_membership: {
        Args: { decision_note?: string; target_membership_id: string };
        Returns: {
          created_at: string;
          decided_at: string | null;
          decided_by: string | null;
          expires_at: string | null;
          id: string;
          invited_at: string | null;
          invited_by: string | null;
          membership_type:
            Database["public"]["Enums"]["organization_membership_type"] | null;
          organization_id: string;
          requested_at: string | null;
          status: Database["public"]["Enums"]["organization_membership_status"];
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_memberships";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      select_primary_organization: {
        Args: { target_organization_id: string };
        Returns: undefined;
      };
      submit_organization_application: {
        Args: { target_application_id: string };
        Returns: {
          accuracy_declaration: boolean;
          admin_feedback: string | null;
          authorization_declaration: boolean;
          created_at: string;
          current_step: number;
          id: string;
          organization_id: string;
          representative_designation: string;
          representative_email: string;
          representative_full_name: string;
          representative_phone: string;
          representative_relationship:
            Database["public"]["Enums"]["representative_relationship"] | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["registration_status"];
          submitted_at: string | null;
          submitted_by: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "organization_applications";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      submit_partnership_enquiry: {
        Args: {
          enquiry_area: Database["public"]["Enums"]["partnership_area"];
          enquiry_country: string;
          enquiry_email: string;
          enquiry_message: string;
          enquiry_name: string;
          enquiry_organization_name: string;
        };
        Returns: string;
      };
      transfer_organization_ownership: {
        Args: {
          previous_owner_new_role: string;
          target_organization_id: string;
          target_user_id: string;
        };
        Returns: undefined;
      };
      transition_partnership_enquiry: {
        Args: {
          target_enquiry_id: string;
          target_status: Database["public"]["Enums"]["partnership_status"];
          transition_note?: string;
        };
        Returns: {
          country: string;
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          organization_name: string;
          partnership_area: Database["public"]["Enums"]["partnership_area"];
          status: Database["public"]["Enums"]["partnership_status"];
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "partnership_enquiries";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      verify_organization_email: {
        Args: { raw_token: string; target_organization_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      application_role: "admin" | "reviewer";
      legal_registration_status: "registered" | "informal";
      organization_category:
        | "tamil_community"
        | "education"
        | "healthcare"
        | "business"
        | "nonprofit"
        | "other";
      organization_manager_history_event:
        | "invited"
        | "invitation_accepted"
        | "invitation_declined"
        | "invitation_revoked"
        | "role_changed"
        | "manager_removed"
        | "manager_left"
        | "ownership_transferred";
      organization_manager_invitation_status:
        "pending" | "accepted" | "declined" | "expired" | "revoked";
      organization_membership_role: "owner" | "admin" | "representative";
      organization_membership_status:
        "pending" | "approved" | "rejected" | "revoked";
      organization_membership_type:
        "general" | "student" | "lifetime" | "honorary";
      partnership_area:
        | "strategic"
        | "community"
        | "education"
        | "healthcare"
        | "business"
        | "events"
        | "technology"
        | "research"
        | "sponsorship"
        | "cultural"
        | "other";
      partnership_status: "new" | "in_discussion" | "active" | "declined";
      registration_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "needs_changes"
        | "verified"
        | "rejected"
        | "suspended";
      representative_relationship:
        | "founder"
        | "president"
        | "secretary"
        | "director"
        | "administrator"
        | "employee"
        | "authorised_representative"
        | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      application_role: ["admin", "reviewer"],
      legal_registration_status: ["registered", "informal"],
      organization_category: [
        "tamil_community",
        "education",
        "healthcare",
        "business",
        "nonprofit",
        "other",
      ],
      organization_manager_history_event: [
        "invited",
        "invitation_accepted",
        "invitation_declined",
        "invitation_revoked",
        "role_changed",
        "manager_removed",
        "manager_left",
        "ownership_transferred",
      ],
      organization_manager_invitation_status: [
        "pending",
        "accepted",
        "declined",
        "expired",
        "revoked",
      ],
      organization_membership_role: ["owner", "admin", "representative"],
      organization_membership_status: [
        "pending",
        "approved",
        "rejected",
        "revoked",
      ],
      organization_membership_type: [
        "general",
        "student",
        "lifetime",
        "honorary",
      ],
      partnership_area: [
        "strategic",
        "community",
        "education",
        "healthcare",
        "business",
        "events",
        "technology",
        "research",
        "sponsorship",
        "cultural",
        "other",
      ],
      partnership_status: ["new", "in_discussion", "active", "declined"],
      registration_status: [
        "draft",
        "submitted",
        "under_review",
        "needs_changes",
        "verified",
        "rejected",
        "suspended",
      ],
      representative_relationship: [
        "founder",
        "president",
        "secretary",
        "director",
        "administrator",
        "employee",
        "authorised_representative",
        "other",
      ],
    },
  },
} as const;
