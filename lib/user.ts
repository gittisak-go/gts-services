import { User, UserFormData } from "@/types/user";
import { supabase } from "@/lib/supabase";

// ดึงข้อมูลผู้ใช้ตาม LINE User ID
export const getUserByLineId = async (
  lineUserId: string
): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("line_user_id", lineUserId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // ไม่พบข้อมูล
        return null;
      }
      console.error("Failed to get user:", error);
      return null;
    }

    if (!data) return null;

    return {
      lineUserId: data.line_user_id,
      fullName: data.full_name,
      phone: data.phone,
      email: data.email || undefined,
      lineDisplayName: data.line_display_name || undefined,
      linePictureUrl: data.line_picture_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at || undefined,
    };
  } catch (error) {
    console.error("Failed to get user:", error);
    return null;
  }
};

// สร้างผู้ใช้ใหม่
export const createUser = async (
  lineUserId: string,
  formData: UserFormData,
  lineProfile?: { displayName?: string; pictureUrl?: string }
): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert({
        line_user_id: lineUserId,
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email || null,
        line_display_name: lineProfile?.displayName || null,
        line_picture_url: lineProfile?.pictureUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create user:", error);
      return null;
    }

    return {
      lineUserId: data.line_user_id,
      fullName: data.full_name,
      phone: data.phone,
      email: data.email || undefined,
      lineDisplayName: data.line_display_name || undefined,
      linePictureUrl: data.line_picture_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at || undefined,
    };
  } catch (error) {
    console.error("Failed to create user:", error);
    return null;
  }
};

// อัปเดตข้อมูลผู้ใช้
export const updateUser = async (
  lineUserId: string,
  formData: Partial<UserFormData>
): Promise<User | null> => {
  try {
    const updateData: any = {};
    if (formData.fullName !== undefined)
      updateData.full_name = formData.fullName;
    if (formData.phone !== undefined) updateData.phone = formData.phone;
    if (formData.email !== undefined) updateData.email = formData.email || null;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("line_user_id", lineUserId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update user:", error);
      return null;
    }

    return {
      lineUserId: data.line_user_id,
      fullName: data.full_name,
      phone: data.phone,
      email: data.email || undefined,
      lineDisplayName: data.line_display_name || undefined,
      linePictureUrl: data.line_picture_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at || undefined,
    };
  } catch (error) {
    console.error("Failed to update user:", error);
    return null;
  }
};

// อัปเดตข้อมูล LINE profile (displayName, pictureUrl)
export const updateLineProfile = async (
  lineUserId: string,
  lineProfile: { displayName?: string; pictureUrl?: string }
): Promise<User | null> => {
  try {
    const updateData: any = {};
    if (lineProfile.displayName !== undefined)
      updateData.line_display_name = lineProfile.displayName;
    if (lineProfile.pictureUrl !== undefined)
      updateData.line_picture_url = lineProfile.pictureUrl;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("line_user_id", lineUserId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update LINE profile:", error);
      return null;
    }

    return {
      lineUserId: data.line_user_id,
      fullName: data.full_name,
      phone: data.phone,
      email: data.email || undefined,
      lineDisplayName: data.line_display_name || undefined,
      linePictureUrl: data.line_picture_url || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at || undefined,
    };
  } catch (error) {
    console.error("Failed to update LINE profile:", error);
    return null;
  }
};

// ตรวจสอบว่าผู้ใช้มีการลงทะเบียนแล้วหรือยัง
export const isUserRegistered = async (
  lineUserId: string
): Promise<boolean> => {
  const user = await getUserByLineId(lineUserId);
  return user !== null;
};
